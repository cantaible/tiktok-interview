"use client";

import { useState, useEffect } from "react";
import { NewsArticle } from "@/types/article";
import { NewsCard } from "@/components/NewsCard";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function HomePage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);

  // Load articles on mount
  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/articles");
      const data = await response.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error("Failed to load articles:", error);
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
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
          toast.error(
            `⚠️ Failed to scrape ${result.errors.length} sources`
          );
        }

        // Reload articles
        await loadArticles();
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
            {articles.length > 0
              ? `${articles.length} articles available`
              : "No articles yet"}
          </p>
        </div>
        <Button onClick={handleFetchNews} disabled={scraping || loading}>
          {scraping ? "Fetching..." : "Fetch News Now"}
        </Button>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton count={6} />
        </div>
      ) : articles.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
