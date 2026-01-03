"use client";

import { useState } from "react";
import { Input } from "../ui/Input";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

interface TagFilterProps {
  topTags: Array<{ tag: string; count: number }>;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagFilter({
  topTags,
  selectedTags,
  onTagsChange,
}: TagFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const filteredTags = topTags.filter((t) =>
    t.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCount = selectedTags.length;

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        <span className="mr-2">🏷️</span>
        {selectedCount > 0 ? `${selectedCount} tags` : "All tags"}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-full mt-2 z-20 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-80 max-h-96 overflow-y-auto">
            <Input
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-3"
            />

            {filteredTags.length === 0 ? (
              <p className="text-sm text-gray-500">No tags found</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {filteredTags.slice(0, 30).map((tag) => (
                  <button
                    key={tag.tag}
                    onClick={() => handleToggleTag(tag.tag)}
                    className={`transition-all ${
                      selectedTags.includes(tag.tag)
                        ? "ring-2 ring-primary"
                        : ""
                    }`}
                  >
                    <Badge variant={selectedTags.includes(tag.tag) ? "info" : "default"}>
                      {tag.tag} ({tag.count})
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
