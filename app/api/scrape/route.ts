import { NextRequest, NextResponse } from "next/server";
import { getSources, saveArticle, getArticleByUrl, updateSource } from "@/lib/db/queries";
import { parseRSSFeed } from "@/lib/scraper/rss-parser";
import { scrapeWebPage } from "@/lib/scraper/web-scraper";
import { deduplicate } from "@/lib/scraper/deduplicator";
import { llmClient } from "@/lib/llm/bailian-client";
import { NewsArticle } from "@/types/article";
import { ScrapeRequest, ScrapeResponse } from "@/types/api";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body: ScrapeRequest = await request.json().catch(() => ({}));
    const { sourceIds, enrichWithLLM = true } = body;

    // Get sources to scrape
    const allSources = getSources({ enabled: true });
    const sourcesToScrape = sourceIds
      ? allSources.filter((s) => sourceIds.includes(s.id))
      : allSources;

    console.log(`🔍 Scraping ${sourcesToScrape.length} sources...`);

    let scraped = 0;
    let deduplicated = 0;
    let enriched = 0;
    let saved = 0;
    const errors: Array<{ sourceId: string; sourceName: string; error: string }> = [];

    // Scrape each source
    const allArticles: Array<{
      title: string;
      sourceURL: string;
      sourceName: string;
      publishedAt?: string;
      description?: string;
      thumbnail?: string;
    }> = [];

    for (const source of sourcesToScrape) {
      try {
        console.log(`📡 Scraping ${source.displayName} (${source.sourceType})...`);

        let articles;
        if (source.sourceType === "RSS") {
          articles = await parseRSSFeed(source.url, source.displayName);
        } else {
          articles = await scrapeWebPage(source.url, source.displayName);
        }

        allArticles.push(
          ...articles.map((a) => ({
            title: a.title,
            sourceURL: a.link,
            sourceName: a.sourceName,
            publishedAt: a.pubDate,
            description: a.description,
            thumbnail: a.thumbnail,
          }))
        );

        scraped += articles.length;

        // Update source success
        updateSource(source.id, {
          lastScrapedAt: new Date().toISOString(),
          errorCount: 0,
        });
      } catch (error) {
        console.error(`❌ Failed to scrape ${source.displayName}:`, error);
        errors.push({
          sourceId: source.id,
          sourceName: source.displayName,
          error: error instanceof Error ? error.message : String(error),
        });

        // Update source error count
        updateSource(source.id, {
          errorCount: source.errorCount + 1,
          enabled: source.errorCount + 1 < 3, // Auto-disable after 3 failures
        });
      }
    }

    // Deduplicate
    const uniqueArticles = deduplicate(allArticles);
    deduplicated = scraped - uniqueArticles.length;
    console.log(`✂️  Deduplicated: ${scraped} → ${uniqueArticles.length} articles`);

    // Filter out existing articles
    const newArticles = uniqueArticles.filter((article) => {
      return !getArticleByUrl(article.sourceURL);
    });

    console.log(`🆕 New articles: ${newArticles.length}`);

    // Enrich with LLM if enabled
    let enrichmentResults: Array<{ summary: string | null; tags: string[] | null }> = [];
    if (enrichWithLLM && newArticles.length > 0) {
      enrichmentResults = await llmClient.enrichBatch(
        newArticles.map((a) => ({
          title: a.title,
          content: a.description,
        }))
      );
      enriched = enrichmentResults.filter((r) => r.summary || r.tags).length;
    }

    // Save to database
    for (let i = 0; i < newArticles.length; i++) {
      const article = newArticles[i];
      const enrichment = enrichmentResults[i] || { summary: null, tags: null };

      const newsArticle: NewsArticle = {
        id: `article-${randomUUID()}`,
        title: article.title,
        sourceURL: article.sourceURL,
        sourceName: article.sourceName,
        publishedAt: article.publishedAt || new Date().toISOString(),
        scrapedAt: new Date().toISOString(),
        summary: enrichment.summary,
        tags: enrichment.tags,
        thumbnailURL: article.thumbnail || null,
        rawContent: article.description || null,
      };

      saveArticle(newsArticle);
      saved++;
    }

    console.log(`✅ Saved ${saved} new articles`);

    const response: ScrapeResponse = {
      success: true,
      scraped,
      deduplicated,
      enriched,
      saved,
      errors,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Scraping failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
