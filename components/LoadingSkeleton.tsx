interface LoadingSkeletonProps {
  count?: number;
}

export function LoadingSkeleton({ count = 6 }: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Thumbnail skeleton */}
          <div className="w-full h-48 bg-gray-200 skeleton" />

          {/* Content skeleton */}
          <div className="p-4">
            {/* Source and time */}
            <div className="flex items-center justify-between mb-2">
              <div className="h-5 w-20 bg-gray-200 rounded-full skeleton" />
              <div className="h-4 w-16 bg-gray-200 rounded skeleton" />
            </div>

            {/* Title */}
            <div className="space-y-2 mb-3">
              <div className="h-6 bg-gray-200 rounded skeleton" />
              <div className="h-6 bg-gray-200 rounded w-3/4 skeleton" />
            </div>

            {/* Summary */}
            <div className="space-y-2 mb-3">
              <div className="h-4 bg-gray-200 rounded skeleton" />
              <div className="h-4 bg-gray-200 rounded w-5/6 skeleton" />
            </div>

            {/* Tags */}
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-gray-200 rounded-full skeleton" />
              <div className="h-5 w-20 bg-gray-200 rounded-full skeleton" />
              <div className="h-5 w-24 bg-gray-200 rounded-full skeleton" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
