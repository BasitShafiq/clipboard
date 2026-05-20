"use client";

import { ClipboardItem as ClipItem } from "@/types";

const API_URL = typeof window !== "undefined"
  ? `${window.location.protocol}//${window.location.hostname}:3001`
  : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Props {
  item: ClipItem;
}

export default function ClipboardItemCard({ item }: Props) {
  const time = new Date(item.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const handleCopyText = async () => {
    if (item.type === "text" && item.content) {
      await navigator.clipboard.writeText(item.content);
    }
  };

  const handleDownloadImage = () => {
    if (item.type === "image" && item.imageUrl) {
      const a = document.createElement("a");
      a.href = `${API_URL}${item.imageUrl}`;
      a.download = item.filename || "image";
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  if (item.type === "text") {
    return (
      <div className="group bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-gray-200 transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                Text
              </span>
              <span className="text-xs text-gray-400">{time}</span>
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
              {item.content}
            </p>
          </div>
          <button
            onClick={handleCopyText}
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-100"
            title="Copy to clipboard"
          >
            Copy
          </button>
        </div>
      </div>
    );
  }

  if (item.type === "image") {
    return (
      <div className="group bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-gray-200 transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
            Image
          </span>
          <span className="text-xs text-gray-400">{time}</span>
          {item.filename && (
            <span className="text-xs text-gray-400 truncate">{item.filename}</span>
          )}
        </div>
        <div className="relative">
          <img
            src={`${API_URL}${item.imageUrl}`}
            alt={item.filename || "Shared image"}
            className="max-w-full max-h-48 rounded-md object-contain bg-white border border-gray-200"
            loading="lazy"
          />
          <button
            onClick={handleDownloadImage}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 text-xs bg-white/90 border border-gray-200 rounded hover:bg-white shadow-sm"
            title="Download image"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return null;
}
