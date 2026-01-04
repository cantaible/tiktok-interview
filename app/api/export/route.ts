import { NextRequest, NextResponse } from "next/server";
import { getArticles } from "@/lib/db/queries";
import { ExportArticle } from "@/types/api";
import { exportToJSON } from "@/lib/export/json-exporter";
import { exportToCSV } from "@/lib/export/csv-exporter";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";
    const date = searchParams.get("date") || undefined;
    const sources = searchParams.get("sources")?.split(",").filter(Boolean) || undefined;
    const tags = searchParams.get("tags")?.split(",").filter(Boolean) || undefined;

    // Fetch articles with filters
    const articles = getArticles({
      date,
      sources,
      tags,
      sort: "newest",
    });

    // Convert to export format
    const exportArticles: ExportArticle[] = articles.map((article): ExportArticle => {
      return {
        id: article.id,
        title: article.title,
        sourceURL: article.sourceURL,
        sourceName: article.sourceName,
        publishedAt: article.publishedAt,
        scrapedAt: article.scrapedAt,
        summary: article.summary,
        tags: article.tags,
        thumbnailURL: article.thumbnailURL,
      };
    });

    if (format === "csv") {
      const csv = exportToCSV(exportArticles);
      const filename = `articles_${new Date().toISOString().split("T")[0]}.csv`;
      
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv;charset=utf-8;",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    } else {
      // Default to JSON
      const json = exportToJSON(exportArticles);
      const filename = `articles_${new Date().toISOString().split("T")[0]}.json`;
      
      return new NextResponse(json, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to export articles",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
