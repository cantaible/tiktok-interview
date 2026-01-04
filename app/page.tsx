"use client";

import { useState, useEffect, useMemo } from "react";
import { NewsArticle } from "@/types/article";
import { NewsCard } from "@/components/NewsCard";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { FilterBar } from "@/components/FilterBar";
import ExportButtons from "@/components/ExportButtons";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { format } from "date-fns";

export default function HomePage() {
  const [allArticles, setAllArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);

  // Filter states
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Stats for filters
  const [sources, setSources] = useState<Array<{ name: string; count: number }>>([]);
  const [topTags, setTopTags] = useState<Array<{ tag: string; count: number }>>([]);

  // Load articles and stats on mount
  useEffect(() => {
    loadArticles();
    loadStats();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/articles");
      const data = await response.json();
      setAllArticles(data.articles || []);
    } catch (error) {
      console.error("Failed to load articles:", error);
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch("/api/articles?path=stats");
      const data = await response.json();
      setSources(data.sources || []);
      setTopTags(data.topTags || []);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  // Client-side filtering with memoization
  const filteredArticles = useMemo(() => {
    let filtered = [...allArticles];

    // Filter by date
    if (selectedDate) {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      filtered = filtered.filter((article) => {
        const articleDate = format(new Date(article.publishedAt), "yyyy-MM-dd");
        return articleDate === dateStr;
      });
    }

    // Filter by sources
    if (selectedSources.length > 0) {
      filtered = filtered.filter((article) =>
        selectedSources.includes(article.sourceName)
      );
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((article) =>
        article.tags?.some((tag) => selectedTags.includes(tag))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.publishedAt).getTime();
      const dateB = new Date(b.publishedAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [allArticles, selectedDate, selectedSources, selectedTags, sortOrder]);

  const hasActiveFilters =
    selectedDate !== undefined ||
    selectedSources.length > 0 ||
    selectedTags.length > 0;

  const handleClearFilters = () => {
    setSelectedDate(undefined);
    setSelectedSources([]);
    setSelectedTags([]);
  };

  const handleFetchNews = async () => {
    try {
      setScraping(true);
      toast.loading("Fetching news from sources...", { id: "scraping" });

      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrichWithLLM: true }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          `✅ Scraped ${result.scraped} articles, saved ${result.saved} new ones`,
          { id: "scraping" }
        );

        if (result.errors.length > 0) {
          toast.error(`⚠️ Failed to scrape ${result.errors.length} sources`);
        }

        // Reload articles and stats
        await loadArticles();
        await loadStats();
      } else {
        toast.error("Failed to fetch news", { id: "scraping" });
      }
    } catch (error) {
      console.error("Scraping error:", error);
      toast.error("Failed to fetch news", { id: "scraping" });
    } finally {
      setScraping(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">News Feed</h2>
          <p className="text-gray-600 mt-1">
            {filteredArticles.length > 0
              ? `${filteredArticles.length} articles ${hasActiveFilters ? "filtered" : "available"}`
              : "No articles yet"}
          </p>
        </div>
        <div className="flex gap-3">
          {filteredArticles.length > 0 && (
            <ExportButtons
              filters={{
                date: selectedDate,
                sources: selectedSources,
                tags: selectedTags,
              }}
            />
          )}
          <Button onClick={handleFetchNews} disabled={scraping || loading}>
            {scraping ? "Fetching..." : "Fetch News Now"}
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      {!loading && allArticles.length > 0 && (
        <FilterBar
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          sources={sources}
          selectedSources={selectedSources}
          onSourcesChange={setSelectedSources}
          topTags={topTags}
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      {/* Articles Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton count={6} />
        </div>
      ) : filteredArticles.length === 0 ? (
        <EmptyState hasFilters={hasActiveFilters} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
