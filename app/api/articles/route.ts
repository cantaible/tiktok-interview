import { NextRequest, NextResponse } from "next/server";
import { getArticles, getArticleStats } from "@/lib/db/queries";
import { GetArticlesResponse, ArticleStatsResponse } from "@/types/api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    // Handle /api/articles/stats
    if (path === "stats") {
      const stats = getArticleStats();
      const response: ArticleStatsResponse = {
        totalArticles: stats.totalArticles,
        sources: stats.sources,
        topTags: stats.topTags,
        dateRange: stats.dateRange,
      };
      return NextResponse.json(response);
    }

    // Handle /api/articles with filters
    const date = searchParams.get("date") || undefined;
    const sources = searchParams.get("sources")?.split(",").filter(Boolean) || undefined;
    const tags = searchParams.get("tags")?.split(",").filter(Boolean) || undefined;
    const sort = (searchParams.get("sort") as "newest" | "oldest") || "newest";
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : undefined;

    const articles = getArticles({
      date,
      sources,
      tags,
      sort,
      limit,
    });

    const response: GetArticlesResponse = {
      articles,
      total: articles.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Get articles error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch articles",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
