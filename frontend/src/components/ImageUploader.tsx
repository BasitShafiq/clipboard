"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useClipboardStore } from "@/store/useClipboardStore";
import { uploadImage } from "@/lib/api";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

export default function ImageUploader() {
  const { sessionId, connected } = useClipboardStore();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndUpload = useCallback(
    async (file: File) => {
      if (!sessionId || !connected) return;

      setError("");

      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Invalid file type. Only PNG, JPG, and WebP are allowed.");
        return;
      }

      if (file.size > MAX_SIZE) {
        setError("File too large. Maximum size is 5MB.");
        return;
      }

      setUploading(true);
      try {
        await uploadImage(sessionId, file);
        // The image-received socket event will update the feed
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [sessionId, connected]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndUpload(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) validateAndUpload(file);
    },
    [validateAndUpload]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      if (!sessionId || !connected) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) validateAndUpload(file);
          return;
        }
      }
    },
    [sessionId, connected, validateAndUpload]
  );

  // Register global paste listener
  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  if (!connected) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Send Image
      </label>

      {error && (
        <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
          {error}
        </div>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-gray-900 bg-gray-50"
            : "border-gray-300 hover:border-gray-400"
        } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-600">Uploading…</span>
          </div>
        ) : (
          <div>
            <svg
              className="w-8 h-8 mx-auto mb-2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm text-gray-600">
              Drop image here, click to browse, or <strong>paste</strong> (Ctrl+V)
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, WebP — Max 5MB
            </p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
