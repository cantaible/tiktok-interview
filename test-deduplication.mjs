/**
 * 去重功能测试脚本
 * 运行: npx tsx test-deduplication.mjs
 */

import { deduplicate, deduplicateByURL, deduplicateByTitle } from './lib/scraper/deduplicator.ts';

console.log('🧪 去重功能测试\n');
console.log('='.repeat(80));

// ============ 测试 1: URL 去重 ============
console.log('\n📌 测试 1: URL 去重（移除追踪参数）\n');

const urlTestArticles = [
  {
    title: 'OpenAI announces GPT-4 Turbo',
    sourceURL: 'https://techcrunch.com/article?utm_source=twitter&utm_medium=social',
    sourceName: 'TechCrunch'
  },
  {
    title: 'OpenAI announces GPT-4 Turbo',
    sourceURL: 'https://techcrunch.com/article?utm_source=facebook',
    sourceName: 'TechCrunch (Facebook)'
  },
  {
    title: 'OpenAI announces GPT-4 Turbo',
    sourceURL: 'https://www.techcrunch.com/article/',
    sourceName: 'TechCrunch (www)'
  },
  {
    title: 'Different article',
    sourceURL: 'https://theverge.com/other-article',
    sourceName: 'The Verge'
  }
];

console.log(`输入: ${urlTestArticles.length} 篇文章`);
urlTestArticles.forEach((a, i) => {
  console.log(`  ${i + 1}. ${a.sourceName}: ${a.sourceURL}`);
});

const urlResult = deduplicateByURL(urlTestArticles);
console.log(`\n输出: ${urlResult.length} 篇文章（去重 ${urlTestArticles.length - urlResult.length} 篇）`);
urlResult.forEach((a, i) => {
  console.log(`  ${i + 1}. ${a.sourceName}: ${a.sourceURL}`);
});

console.log(`\n✅ 测试通过: ${urlResult.length === 2 ? 'YES' : 'NO'}`);

// ============ 测试 2: 标题相似度去重 ============
console.log('\n' + '='.repeat(80));
console.log('\n📌 测试 2: 标题相似度去重（85% 阈值）\n');

const titleTestArticles = [
  {
    title: 'OpenAI Announces GPT-4 Turbo with 128K Context',
    sourceURL: 'https://techcrunch.com/1',
    sourceName: 'TechCrunch'
  },
  {
    title: 'OpenAI announces GPT-4 Turbo with 128k context',  // 大小写不同
    sourceURL: 'https://theverge.com/2',
    sourceName: 'The Verge'
  },
  {
    title: 'OpenAI Releases GPT-4 Turbo With 128K Context',   // 词汇略有不同
    sourceURL: 'https://arstechnica.com/3',
    sourceName: 'Ars Technica'
  },
  {
    title: 'Google Announces Gemini Ultra AI Model',           // 完全不同
    sourceURL: 'https://blog.google/4',
    sourceName: 'Google Blog'
  },
  {
    title: 'Microsoft Releases Copilot Pro',                   // 完全不同
    sourceURL: 'https://microsoft.com/5',
    sourceName: 'Microsoft'
  }
];

console.log(`输入: ${titleTestArticles.length} 篇文章`);
titleTestArticles.forEach((a, i) => {
  console.log(`  ${i + 1}. ${a.title.substring(0, 50)}... (${a.sourceName})`);
});

const titleResult = deduplicateByTitle(titleTestArticles);
console.log(`\n输出: ${titleResult.length} 篇文章（去重 ${titleTestArticles.length - titleResult.length} 篇）`);
titleResult.forEach((a, i) => {
  console.log(`  ${i + 1}. ${a.title.substring(0, 50)}... (${a.sourceName})`);
});

console.log(`\n✅ 测试通过: ${titleResult.length === 3 ? 'YES' : 'NO'}`);

// ============ 测试 3: 中文标题 ============
console.log('\n' + '='.repeat(80));
console.log('\n📌 测试 3: 中文标题去重\n');

const chineseTestArticles = [
  {
    title: 'OpenAI 发布 GPT-4 Turbo，支持 128K 上下文',
    sourceURL: 'https://jiqizhixin.com/1',
    sourceName: '机器之心'
  },
  {
    title: 'OpenAI发布GPT-4 Turbo, 支持128K上下文',  // 空格和标点不同
    sourceURL: 'https://qbitai.com/2',
    sourceName: '量子位'
  },
  {
    title: 'OpenAI 正式推出 GPT-4 Turbo 模型',      // 词汇不同但相似
    sourceURL: 'https://infoq.cn/3',
    sourceName: 'InfoQ'
  },
  {
    title: '谷歌发布 Gemini Ultra 大模型',          // 完全不同
    sourceURL: 'https://google.cn/4',
    sourceName: 'Google 中国'
  }
];

console.log(`输入: ${chineseTestArticles.length} 篇文章`);
chineseTestArticles.forEach((a, i) => {
  console.log(`  ${i + 1}. ${a.title} (${a.sourceName})`);
});

const chineseResult = deduplicateByTitle(chineseTestArticles);
console.log(`\n输出: ${chineseResult.length} 篇文章（去重 ${chineseTestArticles.length - chineseResult.length} 篇）`);
chineseResult.forEach((a, i) => {
  console.log(`  ${i + 1}. ${a.title} (${a.sourceName})`);
});

console.log(`\n✅ 测试通过: ${chineseResult.length >= 2 && chineseResult.length <= 3 ? 'YES (2-3篇合理)' : 'NO'}`);

// ============ 测试 4: 综合去重 ============
console.log('\n' + '='.repeat(80));
console.log('\n📌 测试 4: 综合去重（URL + 标题）\n');

const combinedTestArticles = [
  {
    title: 'Breaking News: OpenAI GPT-4',
    sourceURL: 'https://example.com/news?utm_source=twitter',
    sourceName: 'Source A'
  },
  {
    title: 'Breaking News: OpenAI GPT-4',
    sourceURL: 'https://www.example.com/news/',  // URL 重复（规范化后）
    sourceName: 'Source B'
  },
  {
    title: 'Breaking News!! OpenAI GPT-4',       // 标题相似
    sourceURL: 'https://another.com/article',
    sourceName: 'Source C'
  },
  {
    title: 'Completely Different News',
    sourceURL: 'https://different.com/news',
    sourceName: 'Source D'
  }
];

console.log(`输入: ${combinedTestArticles.length} 篇文章`);
combinedTestArticles.forEach((a, i) => {
  console.log(`  ${i + 1}. "${a.title}" - ${a.sourceURL}`);
});

const combinedResult = deduplicate(combinedTestArticles);
console.log(`\n输出: ${combinedResult.length} 篇文章（去重 ${combinedTestArticles.length - combinedResult.length} 篇）`);
combinedResult.forEach((a, i) => {
  console.log(`  ${i + 1}. "${a.title}" - ${a.sourceURL}`);
});

console.log(`\n✅ 测试通过: ${combinedResult.length === 2 ? 'YES' : 'NO'}`);

// ============ 测试总结 ============
console.log('\n' + '='.repeat(80));
console.log('\n📊 测试总结\n');

const allTests = [
  { name: 'URL 去重', pass: urlResult.length === 2 },
  { name: '标题相似度去重', pass: titleResult.length === 3 },
  { name: '中文标题去重', pass: chineseResult.length >= 2 && chineseResult.length <= 3 },
  { name: '综合去重', pass: combinedResult.length === 2 }
];

allTests.forEach(test => {
  console.log(`  ${test.pass ? '✅' : '❌'} ${test.name}`);
});

const passedTests = allTests.filter(t => t.pass).length;
console.log(`\n总计: ${passedTests}/${allTests.length} 测试通过\n`);

if (passedTests === allTests.length) {
  console.log('🎉 所有测试通过！去重功能正常工作。\n');
} else {
  console.log('⚠️ 部分测试失败，请检查去重逻辑。\n');
}
