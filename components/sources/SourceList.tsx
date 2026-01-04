"use client";

import { NewsSource } from "@/types/source";
import SourceListItem from "./SourceListItem";

interface SourceListProps {
  sources: NewsSource[];
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
  deletingId?: string;
}

export default function SourceList({
  sources,
  onToggle,
  onDelete,
  deletingId,
}: SourceListProps) {
  if (sources.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <div className="text-4xl mb-4">📡</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Sources Yet
        </h3>
        <p className="text-gray-600">
          Add your first RSS feed or web page to start collecting news
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sources.map((source) => (
        <SourceListItem
          key={source.id}
          source={source}
          onToggle={onToggle}
          onDelete={onDelete}
          isDeleting={deletingId === source.id}
        />
      ))}
    </div>
  );
}
