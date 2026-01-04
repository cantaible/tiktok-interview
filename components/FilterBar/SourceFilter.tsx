"use client";

import { useState } from "react";
import { Button } from "../ui/Button";

interface SourceFilterProps {
  sources: Array<{ name: string; count: number }>;
  selectedSources: string[];
  onSourcesChange: (sources: string[]) => void;
}

export function SourceFilter({
  sources,
  selectedSources,
  onSourcesChange,
}: SourceFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleSource = (sourceName: string) => {
    if (selectedSources.includes(sourceName)) {
      onSourcesChange(selectedSources.filter((s) => s !== sourceName));
    } else {
      onSourcesChange([...selectedSources, sourceName]);
    }
  };

  const selectedCount = selectedSources.length;

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        <span className="mr-2">🗂️</span>
        {selectedCount > 0 ? `${selectedCount} sources` : "All sources"}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-full mt-2 z-20 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-64 max-h-96 overflow-y-auto">
            {sources.length === 0 ? (
              <p className="text-sm text-gray-500">No sources available</p>
            ) : (
              <div className="space-y-2">
                {sources.map((source) => (
                  <label
                    key={source.name}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSources.includes(source.name)}
                      onChange={() => handleToggleSource(source.name)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="flex-1 text-sm">{source.name}</span>
                    <span className="text-xs text-gray-500">
                      ({source.count})
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
