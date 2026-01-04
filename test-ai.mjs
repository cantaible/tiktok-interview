/**
 * 测试 DashScope API
 */

import { llmClient } from './lib/llm/bailian-client.ts';

async function testAI() {
  console.log('🧪 测试 DashScope API...\n');

  console.log('1️⃣ 检查配置...');
  const isConfigured = llmClient.isConfigured();
  console.log(`   配置状态: ${isConfigured ? '✅ 已配置' : '❌ 未配置'}\n`);

  if (!isConfigured) {
    console.error('❌ API 未配置');
    process.exit(1);
  }

  console.log('2️⃣ 测试摘要生成...');
  const testTitle = 'OpenAI 发布 GPT-4 Turbo';
  const testContent = 'OpenAI 推出 GPT-4 Turbo，支持 128K tokens，价格降低 3 倍。';

  try {
    const summary = await llmClient.generateSummary(testTitle, testContent);
    console.log(`   摘要: ${summary || '❌ 失败'}\n`);

    console.log('3️⃣ 测试标签提取...');
    const tags = await llmClient.generateTags(testTitle, testContent);
    console.log(`   标签: ${tags ? tags.join(', ') : '❌ 失败'}\n`);

    console.log('✅ 测试完成！');
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testAI();
