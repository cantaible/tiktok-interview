/**
 * Global AI refresh button with progress tracking and cancellation
 * Implements v2 global AI refresh feature (FR-002, FR-003, FR-004)
 */

'use client';

import { useState } from 'react';
import { useAIRefresh } from '@/lib/hooks/useAIRefresh';
import ProgressBar from './ui/ProgressBar';

interface AIRefreshButtonProps {
  /** Article IDs to refresh */
  articleIds: string[];
  /** Callback when refresh completes */
  onComplete?: () => void;
}

export default function AIRefreshButton({ articleIds, onComplete }: AIRefreshButtonProps) {
  const { isRefreshing, progress, startRefresh, cancelRefresh } = useAIRefresh(onComplete);

  const handleRefresh = async () => {
    if (articleIds.length === 0) {
      alert('No articles to refresh');
      return;
    }

    await startRefresh(articleIds);
  };

  if (isRefreshing) {
    return (
      <div className="flex flex-col space-y-2 bg-white rounded-lg p-4 shadow-md min-w-[280px]">
        <ProgressBar
          progress={progress.percentage}
          current={progress.processed}
          total={progress.total}
        />
        <button
          onClick={cancelRefresh}
          className="mt-2 px-3 py-1.5 text-sm bg-red-500 text-white font-semibold rounded hover:bg-red-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={articleIds.length === 0}
      className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
    >
      Refresh AI Content
    </button>
  );
}
