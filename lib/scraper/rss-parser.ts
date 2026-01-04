import Parser from "rss-parser";
import * as cheerio from "cheerio";

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
      ["content:encoded", "content:encoded"],
    ],
  },
});

/**
 * Extract image URL from HTML content using regex
 */
function extractImageFromHTML(html: string): string | undefined {
  if (!html) return undefined;
  
  // Try multiple patterns to find images
  const patterns = [
    // Standard <img src="...">
    /<img[^>]+src=["']([^"']+)["']/i,
    // <img> with other attributes before src
    /<img[^>]*?\s+src=["']([^"']+)["']/i,
    // HTML entities in src
    /<img[^>]+src=["']([^"']+)["'][^>]*>/i,
  ];
  
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      let url = match[1];
      
      // Decode HTML entities
      url = url.replace(/&amp;/g, '&')
                .replace(/&#038;/g, '&')
                .replace(/%E2%80%AF/g, '');
      
      // Filter out tracking pixels, small images, and icons
      if (url.includes('1x1') || 
          url.includes('pixel') || 
          url.includes('tracker') ||
          url.includes('icon') ||
          url.includes('logo') ||
          url.match(/\d+x\d+/) && parseInt(url.match(/(\d+)x\d+/)?.[1] || '0') < 100) {
        continue;
      }
      
      return url;
    }
  }
  
  return undefined;
}

/**
 * Extract image from article page as fallback
 */
async function extractImageFromArticle(url: string): Promise<string | undefined> {
  try {
    const response = await fetch(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)' },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    if (!response.ok) return undefined;
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Try Open Graph image
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage) return ogImage;
    
    // Try Twitter card image
    const twitterImage = $('meta[name="twitter:image"]').attr('content');
    if (twitterImage) return twitterImage;
    
    // Try first article image
    const articleImg = $('article img, .article img, .post img').first().attr('src');
    if (articleImg) {
      return new URL(articleImg, url).href;
    }
    
    return undefined;
  } catch (error) {
    // Silently fail - this is just a fallback
    return undefined;
  }
}

export async function parseRSSFeed(url: string, sourceName?: string): Promise<RSSArticle[]> {
  try {
    const feed = await parser.parseURL(url);
    const detectedName = sourceName || feed.title || "Unknown Source";

    const articles = await Promise.all(
      feed.items.map(async (item, index) => {
        // Extract thumbnail from various RSS formats
        let thumbnail: string | undefined;
        
        // Strategy 1: Try HTML content first (most RSS feeds embed images here)
        const contentHTML = item.content || item['content:encoded'] || item.contentSnippet;
        if (contentHTML) {
          thumbnail = extractImageFromHTML(contentHTML);
        }
        
        // Strategy 2: Try structured media fields if HTML extraction failed
        if (!thumbnail && item.thumbnail) {
          thumbnail = typeof item.thumbnail === "string" ? item.thumbnail : item.thumbnail.$.url;
        }
        
        if (!thumbnail && item.mediaContent) {
          thumbnail =
            typeof item.mediaContent === "string"
              ? item.mediaContent
              : item.mediaContent.$.url;
        }
        
        if (!thumbnail && item.enclosure && item.enclosure.type?.startsWith("image")) {
          thumbnail = item.enclosure.url;
        }
        
        // Strategy 3: For first 5 items, try fetching from article page (fallback)
        if (!thumbnail && index < 5 && item.link) {
          thumbnail = await extractImageFromArticle(item.link);
        }

        return {
          title: item.title || "Untitled",
          link: item.link || "",
          pubDate: item.pubDate || item.isoDate,
          description: item.contentSnippet || item.content || item.summary || "",
          thumbnail,
          sourceName: detectedName,
        };
      })
    );

    return articles;
  } catch (error: unknown) {
    throw new Error(
      `RSS parsing failed for ${url}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export function detectRSSName(feed: Parser.Output<Record<string, unknown>>): string {
  return feed.title || "Unknown Source";
}
