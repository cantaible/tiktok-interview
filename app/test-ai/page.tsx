/**
 * AI 功能诊断和测试页面
 */

'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AITestPage() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{
    configured: boolean;
    summaryTest?: string | null;
    tagsTest?: string[] | null;
    error?: string;
  } | null>(null);

  const testAI = async () => {
    setTesting(true);
    setResults(null);

    try {
      toast.loading('测试 AI 功能...', { id: 'ai-test' });

      const response = await fetch('/api/test-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'OpenAI 发布 GPT-4 Turbo',
          content: 'OpenAI 今天宣布推出 GPT-4 Turbo，支持 128K tokens 上下文，价格降低 3 倍。'
        })
      });

      const data = await response.json();
      setResults(data);

      if (data.configured && data.summaryTest) {
        toast.success('AI 功能正常！', { id: 'ai-test' });
      } else {
        toast.error('AI 功能异常', { id: 'ai-test' });
      }
    } catch (error) {
      console.error('测试失败:', error);
      toast.error('测试失败', { id: 'ai-test' });
      setResults({ configured: false, error: String(error) });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">AI 功能诊断</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">测试 DashScope API</h2>
          <p className="text-gray-600 mb-4">
            点击按钮测试 AI 摘要生成和标签提取功能
          </p>
          <button
            onClick={testAI}
            disabled={testing}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {testing ? '测试中...' : '开始测试'}
          </button>
        </div>

        {results && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">测试结果</h2>
            
            <div className="space-y-4">
              <div>
                <label className="font-medium text-gray-700">API 配置状态:</label>
                <p className={`text-lg ${results.configured ? 'text-green-600' : 'text-red-600'}`}>
                  {results.configured ? '✅ 已配置' : '❌ 未配置'}
                </p>
              </div>

              {results.configured && (
                <>
                  <div>
                    <label className="font-medium text-gray-700">生成的摘要:</label>
                    <p className="mt-1 p-3 bg-gray-50 rounded border">
                      {results.summaryTest || '❌ 生成失败'}
                    </p>
                  </div>

                  <div>
                    <label className="font-medium text-gray-700">提取的标签:</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {results.tagsTest && results.tagsTest.length > 0 ? (
                        results.tagsTest.map((tag, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">❌ 提取失败</span>
                      )}
                    </div>
                  </div>
                </>
              )}

              {results.error && (
                <div>
                  <label className="font-medium text-red-700">错误信息:</label>
                  <p className="mt-1 p-3 bg-red-50 rounded border border-red-200 text-red-800">
                    {results.error}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">💡 故障排查</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 检查 .env.local 文件中的 DASHSCOPE_API_KEY 是否正确</li>
            <li>• 确认已重启开发服务器 (npm run dev)</li>
            <li>• 查看服务器终端是否有错误日志</li>
            <li>• 验证 API Key 是否有效且有足够余额</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
