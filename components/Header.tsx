/**
 * Header component with gradient background and action buttons
 * Implements v2 design system (FR-014, FR-015)
 */

'use client';

import Link from 'next/link';
import AIRefreshButton from './AIRefreshButton';

interface HeaderProps {
  /** IDs of currently displayed articles for AI refresh */
  articleIds?: string[];
  onFetchNews?: () => void;
  /** Callback when AI refresh completes */
  onRefreshComplete?: () => void;
}

export default function Header({ articleIds = [], onFetchNews, onRefreshComplete }: HeaderProps) {
  return (
    <header className="bg-header-gradient shadow-md">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <span className="text-3xl">📰</span>
            <h1 className="text-2xl font-bold text-white">Local News Harvester</h1>
          </Link>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={onFetchNews}
              className="px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
            >
              Fetch News
            </button>
            
            <AIRefreshButton articleIds={articleIds} onComplete={onRefreshComplete} />
          </div>
        </div>
      </div>
    </header>
  );
}
