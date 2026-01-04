import { NewsArticle } from "@/types/article";
import { Badge } from "./ui/Badge";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

interface NewsCardProps {
  article: NewsArticle;
}

export function NewsCard({ article }: NewsCardProps) {
  const relativeTime = formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true });

  const handleTitleClick = () => {
    window.open(article.sourceURL, "_blank", "noopener,noreferrer");
  };

  const truncateTitle = (title: string, maxLength = 150) => {
    return title.length > maxLength ? title.substring(0, maxLength) + "..." : title;
  };

  return (
    <div className="bg-white rounded-xl border-2 border-transparent bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Thumbnail */}
      <div className="relative w-full h-48 bg-gray-100">
        <Image
          src={article.thumbnailURL || "/placeholder.svg"}
          alt={article.title}
          fill
          className="object-cover"
          unoptimized
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
      </div>

      {/* Content */}
      <div className="p-4 bg-white">
        {/* Source and Time */}
        <div className="flex items-center justify-between mb-2">
          <Badge variant="info">{article.sourceName}</Badge>
          <span className="text-xs text-gray-500">{relativeTime}</span>
        </div>

        {/* Title */}
        <h3
          className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-primary transition-colors line-clamp-2"
          onClick={handleTitleClick}
          title={article.title}
        >
          {truncateTitle(article.title)}
        </h3>

        {/* Summary */}
        {article.summary && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{article.summary}</p>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 text-xs font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:scale-105 transition-transform duration-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
