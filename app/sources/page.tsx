"use client";

import { useState, useEffect } from "react";
import { NewsSource } from "@/types/source";
import { GetSourcesResponse, CreateSourceRequest, CreateSourceResponse } from "@/types/api";
import SourceForm from "@/components/sources/SourceForm";
import SourceList from "@/components/sources/SourceList";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function SourcesPage() {
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | undefined>();

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/sources");
      const data: GetSourcesResponse = await response.json();
      setSources(data.sources);
    } catch (error) {
      console.error("Failed to load sources:", error);
      toast.error("Failed to load sources");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSource = async (sourceData: CreateSourceRequest) => {
    try {
      const response = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sourceData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add source");
      }

      const data: CreateSourceResponse = await response.json();
      
      if (data.success && data.source) {
        setSources([...sources, data.source]);
        setShowForm(false);
        toast.success(`Source "${data.source.displayName}" added successfully`);
      }
    } catch (error) {
      console.error("Add source error:", error);
      throw error; // Re-throw to show in form
    }
  };

  const handleToggleSource = async (id: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/sources/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });

      if (!response.ok) {
        throw new Error("Failed to update source");
      }

      const data = await response.json();
      
      if (data.success && data.source) {
        setSources(sources.map((s) => (s.id === id ? data.source : s)));
        toast.success(`Source ${enabled ? "enabled" : "disabled"}`);
      }
    } catch (error) {
      console.error("Toggle source error:", error);
      toast.error("Failed to update source");
    }
  };

  const handleDeleteSource = async (id: string) => {
    try {
      setDeletingId(id);
      const response = await fetch(`/api/sources/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete source");
      }

      setSources(sources.filter((s) => s.id !== id));
      toast.success("Source deleted successfully");
    } catch (error) {
      console.error("Delete source error:", error);
      toast.error("Failed to delete source");
    } finally {
      setDeletingId(undefined);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">News Sources</h1>
        <Button
          variant="primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "Add Source"}
        </Button>
      </div>

      {showForm && (
        <div className="mb-6">
          <SourceForm
            onSubmit={handleAddSource}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {sources.length} source{sources.length !== 1 ? "s" : ""} total •{" "}
          {sources.filter((s) => s.enabled).length} enabled
        </p>
      </div>

      <SourceList
        sources={sources}
        onToggle={handleToggleSource}
        onDelete={handleDeleteSource}
        deletingId={deletingId}
      />
    </div>
  );
}
