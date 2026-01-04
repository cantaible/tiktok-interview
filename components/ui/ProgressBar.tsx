/**
 * Progress bar component for AI refresh operations
 * Implements v2 AI refresh progress tracking (FR-003)
 */

'use client';

interface ProgressBarProps {
  /** Current progress percentage (0-100) */
  progress: number;
  /** Current article count processed */
  current: number;
  /** Total article count */
  total: number;
}

export default function ProgressBar({ progress, current, total }: ProgressBarProps) {
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>Refreshing AI content...</span>
        <span className="font-medium">{current}/{total} articles</span>
      </div>
      
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        {progress.toFixed(0)}% complete
      </div>
    </div>
  );
}
