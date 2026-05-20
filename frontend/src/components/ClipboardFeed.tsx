"use client";

import { useClipboardStore } from "@/store/useClipboardStore";
import ClipboardItemCard from "./ClipboardItemCard";

export default function ClipboardFeed() {
  const { history, connected } = useClipboardStore();

  if (!connected) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Clipboard Feed
      </h2>

      {history.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <svg
            className="w-12 h-12 mx-auto mb-3 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-sm">No items yet</p>
          <p className="text-xs mt-1">
            Send text or images from any connected device
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {history.map((item, i) => (
            <ClipboardItemCard key={`${item.timestamp}-${i}`} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
