import { ExportArticle } from "@/types/api";

export function exportToJSON(articles: ExportArticle[]): string {
  return JSON.stringify(articles, null, 2);
}

export function createJSONBlob(articles: ExportArticle[]): Blob {
  const jsonString = exportToJSON(articles);
  return new Blob([jsonString], { type: "application/json" });
}

export function downloadJSON(articles: ExportArticle[], filename: string = "articles.json"): void {
  const blob = createJSONBlob(articles);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
