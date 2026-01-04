interface EmptyStateProps {
  message?: string;
  hasFilters?: boolean;
}

export function EmptyState({
  message,
  hasFilters = false,
}: EmptyStateProps) {
  const defaultMessage = hasFilters
    ? "No articles match your filters. Try adjusting your search criteria."
    : "No articles yet. Click 'Fetch News Now' to start collecting news from your sources.";

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-6xl mb-4">📰</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {hasFilters ? "No Results Found" : "No Articles Yet"}
      </h3>
      <p className="text-gray-600 text-center max-w-md">{message || defaultMessage}</p>
    </div>
  );
}
