/**
 * AI 功能测试 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { llmClient } from '@/lib/llm/bailian-client';

export async function POST(request: NextRequest) {
  try {
    const { title, content } = await request.json();

    // 检查配置
    const isConfigured = llmClient.isConfigured();
    
    if (!isConfigured) {
      return NextResponse.json({
        configured: false,
        error: 'DASHSCOPE_API_KEY not configured in .env.local'
      });
    }

    // 测试生成摘要
    const summary = await llmClient.generateSummary(title, content);
    
    // 测试提取标签
    const tags = await llmClient.generateTags(title, content);

    return NextResponse.json({
      configured: true,
      summaryTest: summary,
      tagsTest: tags,
      apiKey: process.env.DASHSCOPE_API_KEY ? 'sk-***' + process.env.DASHSCOPE_API_KEY.slice(-4) : 'not set'
    });
  } catch (error) {
    console.error('AI test failed:', error);
    return NextResponse.json({
      configured: llmClient.isConfigured(),
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
