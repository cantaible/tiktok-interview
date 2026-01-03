"use client";

import { NewsSource } from "@/types/source";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDistanceToNow } from "date-fns";

interface SourceListItemProps {
  source: NewsSource;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export default function SourceListItem({
  source,
  onToggle,
  onDelete,
  isDeleting,
}: SourceListItemProps) {
  const handleDelete = () => {
    if (window.confirm(`Delete "${source.displayName}"? This cannot be undone.`)) {
      onDelete(source.id);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {source.displayName}
            </h3>
            <Badge variant={source.sourceType === "RSS" ? "info" : "default"}>
              {source.sourceType}
            </Badge>
            <Badge variant={source.enabled ? "success" : "default"}>
              {source.enabled ? "Enabled" : "Disabled"}
            </Badge>
            {source.errorCount > 0 && (
              <Badge variant="error">
                {source.errorCount} error{source.errorCount > 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          <p className="text-sm text-gray-600 truncate mb-2">{source.url}</p>

          {source.lastScrapedAt && (
            <p className="text-xs text-gray-500">
              Last scraped{" "}
              {formatDistanceToNow(new Date(source.lastScrapedAt), { addSuffix: true })}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={source.enabled}
              onChange={(e) => onToggle(source.id, e.target.checked)}
              className="sr-only"
            />
            <div
              className={`relative w-11 h-6 transition-colors duration-200 ease-in-out rounded-full ${
                source.enabled ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out ${
                  source.enabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </div>
          </label>

          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-sm"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
