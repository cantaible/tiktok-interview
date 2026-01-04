"use client";

import { DatePicker } from "./FilterBar/DatePicker";
import { SourceFilter } from "./FilterBar/SourceFilter";
import { TagFilter } from "./FilterBar/TagFilter";
import { Button } from "./ui/Button";

interface FilterBarProps {
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  sources: Array<{ name: string; count: number }>;
  selectedSources: string[];
  onSourcesChange: (sources: string[]) => void;
  topTags: Array<{ tag: string; count: number }>;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  sortOrder: "newest" | "oldest";
  onSortChange: (sort: "newest" | "oldest") => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function FilterBar({
  selectedDate,
  onDateChange,
  sources,
  selectedSources,
  onSourcesChange,
  topTags,
  selectedTags,
  onTagsChange,
  sortOrder,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
}: FilterBarProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <DatePicker selectedDate={selectedDate} onDateChange={onDateChange} />
        <SourceFilter
          sources={sources}
          selectedSources={selectedSources}
          onSourcesChange={onSourcesChange}
        />
        <TagFilter
          topTags={topTags}
          selectedTags={selectedTags}
          onTagsChange={onTagsChange}
        />
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Sort:</span>
          <select
            value={sortOrder}
            onChange={(e) => onSortChange(e.target.value as "newest" | "oldest")}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClearFilters} className="text-sm">
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}
