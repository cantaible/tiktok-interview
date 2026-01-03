"use client";

import { Button } from "@/components/ui/Button";
import { useState } from "react";
import toast from "react-hot-toast";

interface ExportButtonsProps {
  filters?: {
    date?: Date;
    sources?: string[];
    tags?: string[];
  };
}

export default function ExportButtons({ filters }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const buildQueryParams = (): string => {
    const params = new URLSearchParams();

    if (filters?.date) {
      params.append("date", filters.date.toISOString().split("T")[0]);
    }

    if (filters?.sources && filters.sources.length > 0) {
      params.append("sources", filters.sources.join(","));
    }

    if (filters?.tags && filters.tags.length > 0) {
      params.append("tags", filters.tags.join(","));
    }

    return params.toString();
  };

  const handleExport = async (format: "json" | "csv") => {
    try {
      setIsExporting(true);
      
      const queryParams = buildQueryParams();
      const url = `/api/export?format=${format}${queryParams ? `&${queryParams}` : ""}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      
      const contentDisposition = response.headers.get("Content-Disposition");
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
        : `articles_${new Date().toISOString().split("T")[0]}.${format}`;

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error(`Failed to export as ${format.toUpperCase()}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={() => handleExport("json")}
        disabled={isExporting}
        className="text-sm"
      >
        {isExporting ? "Exporting..." : "Export JSON"}
      </Button>
      <Button
        variant="outline"
        onClick={() => handleExport("csv")}
        disabled={isExporting}
        className="text-sm"
      >
        {isExporting ? "Exporting..." : "Export CSV"}
      </Button>
    </div>
  );
}
