"use client";

import ConnectionPanel from "@/components/ConnectionPanel";
import TextInput from "@/components/TextInput";
import ImageUploader from "@/components/ImageUploader";
import ClipboardFeed from "@/components/ClipboardFeed";
import { useClipboardStore } from "@/store/useClipboardStore";

export default function Home() {
  const connected = useClipboardStore((s) => s.connected);

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center mb-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Clip
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Cross-device clipboard — share text &amp; images instantly
        </p>
      </div>

      {/* Connection */}
      <ConnectionPanel />

      {/* Input sections (only when connected) */}
      {connected && (
        <div className="grid md:grid-cols-2 gap-4">
          <TextInput />
          <ImageUploader />
        </div>
      )}

      {/* Feed */}
      <ClipboardFeed />
    </main>
  );
}
