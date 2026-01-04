import { NextRequest, NextResponse } from "next/server";
import { getSources, saveSource } from "@/lib/db/queries";
import { NewsSource } from "@/types/source";
import {
  GetSourcesResponse,
  CreateSourceRequest,
  CreateSourceResponse,
} from "@/types/api";
import { randomUUID } from "crypto";
import Parser from "rss-parser";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const enabledParam = searchParams.get("enabled");

    const filters =
      enabledParam !== null ? { enabled: enabledParam === "true" } : undefined;

    const sources = getSources(filters);

    const response: GetSourcesResponse = {
      sources,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Get sources error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch sources",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateSourceRequest = await request.json();
    const { sourceType, url, displayName } = body;

    // Validate input
    if (!sourceType || !url) {
      return NextResponse.json(
        { success: false, error: "sourceType and url are required" },
        { status: 400 }
      );
    }

    if (sourceType !== "RSS" && sourceType !== "WEB") {
      return NextResponse.json(
        { success: false, error: "sourceType must be RSS or WEB" },
        { status: 400 }
      );
    }

    // Auto-detect display name for RSS feeds
    let finalDisplayName = displayName;
    if (sourceType === "RSS" && !displayName) {
      try {
        const parser = new Parser();
        const feed = await parser.parseURL(url);
        finalDisplayName = feed.title || "Unknown Source";
      } catch (error) {
        console.warn("Failed to auto-detect RSS name:", error);
        finalDisplayName = "Unknown Source";
      }
    }

    if (!finalDisplayName) {
      return NextResponse.json(
        { success: false, error: "displayName is required for WEB sources" },
        { status: 400 }
      );
    }

    const newSource: NewsSource = {
      id: `source-${randomUUID()}`,
      sourceType,
      url,
      displayName: finalDisplayName,
      enabled: true,
      lastScrapedAt: null,
      errorCount: 0,
    };

    saveSource(newSource);

    const response: CreateSourceResponse = {
      success: true,
      source: newSource,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Create source error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create source",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
