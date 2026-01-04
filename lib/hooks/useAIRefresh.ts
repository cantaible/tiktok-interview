/**
 * Custom hook for managing AI refresh operations
 * Implements v2 global AI refresh with progress tracking (FR-002, FR-003)












































































});  process.exit(1);  console.error('💥 测试失败:', error);testAI().catch(error => {// 运行测试}  console.log('✅ 测试完成！');  }    console.error('');    console.error('   ❌ 批量处理失败:', error);  } catch (error) {    console.log('');    });      console.log(`     标签: ${result.tags ? result.tags.join(', ') : '❌'}`);      console.log(`     摘要: ${result.summary || '❌'}`);      console.log(`   - 文章 ${i + 1}:`);    results.forEach((result, i) => {    console.log(`   批量处理 ${testArticles.length} 篇文章:`);    const results = await llmClient.enrichBatch(testArticles);  try {  ];    }      content: 'Google 最新的 Gemini Ultra 模型在多模态理解任务上超越了 GPT-4，支持文本、图像和视频。'      title: 'Google 发布 Gemini Ultra 多模态模型',    {    },      content: '微软宣布推出 Copilot Pro，每月 20 美元，提供更快的 AI 响应和 Office 应用集成。'      title: '微软推出 Copilot Pro 订阅服务',    {  const testArticles = [  console.log('4️⃣ 测试批量处理...');  // 测试批量处理  }    console.error('');    console.error('   ❌ 标签提取失败:', error);  } catch (error) {    console.log(`   提取标签: ${tags ? tags.join(', ') : '❌ 提取失败'}\n`);    const tags = await llmClient.generateTags(testTitle, testContent);  try {  console.log('3️⃣ 测试标签提取...');  // 测试标签提取  }    console.error('');    console.error('   ❌ 摘要生成失败:', error);  } catch (error) {    console.log(`   生成摘要: ${summary || '❌ 生成失败'}\n`);    console.log(`   标题: ${testTitle}`);    const summary = await llmClient.generateSummary(testTitle, testContent);  try {  const testContent = 'OpenAI 今天宣布推出 GPT-4 Turbo，这是 GPT-4 模型的升级版本。新模型支持更长的上下文窗口，最高可达 128K tokens，同时价格降低了 3 倍。此外，GPT-4 Turbo 的知识更新到了 2024 年 4 月，并支持函数调用和 JSON 模式输出。';  const testTitle = 'OpenAI 发布 GPT-4 Turbo，性能提升价格降低';  console.log('2️⃣ 测试摘要生成...');  // 测试摘要生成  }    process.exit(1);    console.error('❌ API 未配置，请检查 .env.local 文件中的 DASHSCOPE_API_KEY');  if (!isConfigured) {  console.log(`   配置状态: ${isConfigured ? '✅ 已配置' : '❌ 未配置'}\n`);  const isConfigured = llmClient.isConfigured();  console.log('1️⃣ 检查配置...');  // 测试配置  console.log('🧪 开始测试 DashScope API...\n');async function testAI() {import { llmClient } from './lib/llm/bailian-client'; */

'use client';

import { useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

interface RefreshProgress {
  percentage: number;
  processed: number;
  total: number;
  sessionId: string | null;
}

export function useAIRefresh(onComplete?: () => void) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [progress, setProgress] = useState<RefreshProgress>({
    percentage: 0,
    processed: 0,
    total: 0,
    sessionId: null,
  });
  
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentSessionRef = useRef<string | null>(null);
  const onCompleteRef = useRef(onComplete);
  
  // Keep onComplete ref up to date
  onCompleteRef.current = onComplete;

  /**
   * Poll progress from server
   */
  const pollProgress = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/ai-refresh?sessionId=${sessionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to poll progress');
      }

      const data = await response.json();
      
      setProgress({
        percentage: data.percentage,
        processed: data.processed,
        total: data.total,
        sessionId,
      });

      // Check if complete
      if (data.status === 'completed' || data.status === 'cancelled') {
        setIsRefreshing(false);
        
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }

        if (data.status === 'completed') {
          toast.success(`AI refresh complete! ${data.processed} articles updated`);
          
          // Call onComplete callback to reload data
          if (onCompleteRef.current) {
            setTimeout(() => {
              onCompleteRef.current?.();
            }, 500); // Small delay to ensure DB is updated
          }
        } else {
          toast.error('AI refresh cancelled');
        }
        
        currentSessionRef.current = null;
      }
    } catch (error) {
      console.error('Failed to poll progress:', error);
      toast.error('Failed to track progress');
    }
  }, []);

  /**
   * Start AI refresh operation
   */
  const startRefresh = useCallback(async (articleIds: string[]) => {
    try {
      setIsRefreshing(true);
      setProgress({
        percentage: 0,
        processed: 0,
        total: articleIds.length,
        sessionId: null,
      });

      // Initiate refresh
      const response = await fetch('/api/ai-refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to start AI refresh');
      }

      const data = await response.json();
      const sessionId = data.sessionId;
      currentSessionRef.current = sessionId;

      toast.success('AI refresh started');

      // Start polling
      pollIntervalRef.current = setInterval(() => {
        pollProgress(sessionId);
      }, 1000); // Poll every 1 second

    } catch (error) {
      console.error('Failed to start AI refresh:', error);
      toast.error('Failed to start AI refresh');
      setIsRefreshing(false);
    }
  }, [pollProgress]);

  /**
   * Cancel ongoing refresh operation
   */
  const cancelRefresh = useCallback(async () => {
    if (!currentSessionRef.current) return;

    try {
      const response = await fetch(`/api/ai-refresh?sessionId=${currentSessionRef.current}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel refresh');
      }

      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }

      setIsRefreshing(false);
      currentSessionRef.current = null;
      
      toast.success('AI refresh cancelled');
    } catch (error) {
      console.error('Failed to cancel refresh:', error);
      toast.error('Failed to cancel refresh');
    }
  }, []);

  return {
    isRefreshing,
    progress,
    startRefresh,
    cancelRefresh,
  };
}
