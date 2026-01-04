import * as cheerio from "cheerio";

export interface ScrapedArticle {
  title: string;
  link: string;
  pubDate?: string;
  description?: string;
  thumbnail?: string;
  sourceName: string;
}

export async function scrapeWebPage(
  url: string,
  sourceName: string
): Promise<ScrapedArticle[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const articles: ScrapedArticle[] = [];

    // Try to find article links using common patterns
    const articleSelectors = [
      "article a[href]",
      ".article a[href]",
      ".post a[href]",
      ".news-item a[href]",
      'a[href*="/article/"]',
      'a[href*="/post/"]',
      'a[href*="/news/"]',
      "main a[href]",
    ];

    const links = new Set<string>();

    articleSelectors.forEach((selector) => {
      $(selector).each((_, elem) => {
        const href = $(elem).attr("href");
        const title = $(elem).text().trim() || $(elem).attr("title");

        if (href && title && title.length > 10) {
          const absoluteUrl = new URL(href, url).href;
          if (!links.has(absoluteUrl) && absoluteUrl.startsWith("http")) {
            links.add(absoluteUrl);

            // Try to find associated image
            const parent = $(elem).closest("article, .article, .post, .news-item");
            const img = parent.find("img").first();
            const thumbnail = img.attr("src")
              ? new URL(img.attr("src")!, url).href
              : undefined;

            // Try to find description
            const desc = parent.find("p").first().text().trim();

            articles.push({
              title: title.substring(0, 500),
              link: absoluteUrl,
              description: desc || undefined,
              thumbnail,
              sourceName,
            });
          }
        }
      });
    });

    // Limit to first 50 articles found
    return articles.slice(0, 50);
  } catch (error) {
    throw new Error(
      `Web scraping failed for ${url}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
