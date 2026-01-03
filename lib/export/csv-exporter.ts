import { ExportArticle } from "@/types/api";

function escapeCSVField(field: string | null | undefined): string {
  if (field === null || field === undefined) return "";
  
  const str = String(field);
  
  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
}

export function exportToCSV(articles: ExportArticle[]): string {
  const headers = [
    "ID",
    "Title",
    "Source URL",
    "Source Name",
    "Published At",
    "Scraped At",
    "Summary",
    "Tags",
    "Thumbnail URL",
  ];

  const rows = articles.map((article) => [
    escapeCSVField(article.id),
    escapeCSVField(article.title),
    escapeCSVField(article.sourceURL),
    escapeCSVField(article.sourceName),
    escapeCSVField(article.publishedAt),
    escapeCSVField(article.scrapedAt),
    escapeCSVField(article.summary),
    escapeCSVField(article.tags?.join("; ") || ""),
    escapeCSVField(article.thumbnailURL),
  ]);

  const csvLines = [headers, ...rows].map((row) => row.join(","));
  
  return csvLines.join("\n");
}

export function createCSVBlob(articles: ExportArticle[]): Blob {
  const csvString = exportToCSV(articles);
  // Add BOM for Excel compatibility with UTF-8
  return new Blob(["\ufeff" + csvString], { type: "text/csv;charset=utf-8;" });
}

export function downloadCSV(articles: ExportArticle[], filename: string = "articles.csv"): void {
  const blob = createCSVBlob(articles);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
