/**
 * Test RSS image extraction
 */
import Parser from 'rss-parser';

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

function extractImageFromHTML(html) {
  if (!html) return undefined;
  
  const patterns = [
    /<img[^>]+src=["']([^"']+)["']/i,
    /<img[^>]*?\s+src=["']([^"']+)["']/i,
    /<img[^>]+src=["']([^"']+)["'][^>]*>/i,
  ];
  
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      let url = match[1];
      url = url.replace(/&amp;/g, '&')
                .replace(/&#038;/g, '&')
                .replace(/%E2%80%AF/g, '');
      
      if (url.includes('1x1') || 
          url.includes('pixel') || 
          url.includes('tracker') ||
          url.includes('icon') ||
          url.includes('logo')) {
        continue;
      }
      
      return url;
    }
  }
  
  return undefined;
}

async function testFeed(url, name) {
  console.log(`\n📡 Testing: ${name}`);
  console.log(`   URL: ${url}`);
  
  try {
    const feed = await parser.parseURL(url);
    const firstItem = feed.items[0];
    
    if (!firstItem) {
      console.log('   ❌ No items found');
      return;
    }
    
    console.log(`   Title: ${firstItem.title?.substring(0, 60)}...`);
    
    // Try HTML extraction
    const contentHTML = firstItem.content || firstItem['content:encoded'] || firstItem.contentSnippet;
    const thumbnail = extractImageFromHTML(contentHTML);
    
    if (thumbnail) {
      console.log(`   ✅ Image found: ${thumbnail.substring(0, 80)}...`);
    } else {
      console.log(`   ❌ No image found`);
      console.log(`   Content preview: ${contentHTML?.substring(0, 200)}...`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

async function main() {
  console.log('🧪 Testing RSS Image Extraction\n');
  console.log('=' .repeat(80));
  
  await testFeed('https://techcrunch.com/feed/', 'TechCrunch');
  await testFeed('https://www.theverge.com/rss/index.xml', 'The Verge');
  await testFeed('https://www.artificialintelligence-news.com/feed/', 'AI News');
  await testFeed('https://www.infoq.cn/feed', 'InfoQ中国');
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ Test complete\n');
}

main().catch(console.error);
