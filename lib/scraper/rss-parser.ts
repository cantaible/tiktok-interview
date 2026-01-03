import Parser from "rss-parser";

export interface RSSArticle {
  title: string;
  link: string;
  pubDate?: string;
  description?: string;
  thumbnail?: string;
  sourceName: string;
}

const parser = new Parser({
  customFields: {
    item: [
      ["media:thumbnail", "thumbnail"],
      ["media:content", "mediaContent"],
      ["enclosure", "enclosure"],
    ],
  },
});

export async function parseRSSFeed(url: string, sourceName?: string): Promise<RSSArticle[]> {
  try {
    const feed = await parser.parseURL(url);
    const detectedName = sourceName || feed.title || "Unknown Source";

    return feed.items.map((item) => {
      // Extract thumbnail from various RSS formats
      let thumbnail: string | undefined;
      if (item.thumbnail) {
        thumbnail = typeof item.thumbnail === "string" ? item.thumbnail : item.thumbnail.$.url;
      } else if (item.mediaContent) {
        thumbnail =
          typeof item.mediaContent === "string"
            ? item.mediaContent
            : item.mediaContent.$.url;
      } else if (item.enclosure && item.enclosure.type?.startsWith("image")) {
        thumbnail = item.enclosure.url;
      }

      return {
        title: item.title || "Untitled",
        link: item.link || "",
        pubDate: item.pubDate || item.isoDate,
        description: item.contentSnippet || item.content || item.description,
        thumbnail,
        sourceName: detectedName,
      };
    });
  } catch (error) {
    throw new Error(
      `RSS parsing failed for ${url}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export function detectRSSName(feed: Parser.Output<any>): string {
  return feed.title || "Unknown Source";
}
