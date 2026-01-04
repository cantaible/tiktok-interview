"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface SourceFormProps {
  onSubmit: (source: { sourceType: "RSS" | "WEB"; url: string; displayName?: string }) => Promise<void>;
  onCancel?: () => void;
}

export default function SourceForm({ onSubmit, onCancel }: SourceFormProps) {
  const [sourceType, setSourceType] = useState<"RSS" | "WEB">("RSS");
  const [url, setUrl] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError("URL is required");
      return;
    }

    if (sourceType === "WEB" && !displayName.trim()) {
      setError("Display name is required for web sources");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        sourceType,
        url: url.trim(),
        displayName: displayName.trim() || undefined,
      });

      // Reset form
      setUrl("");
      setDisplayName("");
      setSourceType("RSS");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add source");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900">Add New Source</h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Source Type
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="sourceType"
              value="RSS"
              checked={sourceType === "RSS"}
              onChange={(e) => setSourceType(e.target.value as "RSS" | "WEB")}
              className="mr-2"
            />
            <span className="text-sm">RSS Feed</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="sourceType"
              value="WEB"
              checked={sourceType === "WEB"}
              onChange={(e) => setSourceType(e.target.value as "RSS" | "WEB")}
              className="mr-2"
            />
            <span className="text-sm">Web Page</span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
          URL <span className="text-red-500">*</span>
        </label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={sourceType === "RSS" ? "https://example.com/feed.xml" : "https://example.com/news"}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
        <p className="mt-1 text-sm text-gray-500">
          {sourceType === "RSS"
            ? "RSS feeds will auto-detect the display name from the feed"
            : "Web page URL to scrape for articles"}
        </p>
      </div>

      {sourceType === "WEB" && (
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
            Display Name <span className="text-red-500">*</span>
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g., TechNews Website"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required={sourceType === "WEB"}
          />
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Source"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
