"use client";

import { useState, useRef } from "react";
import { getSocket } from "@/lib/socket";
import { useClipboardStore } from "@/store/useClipboardStore";

export default function TextInput() {
  const [text, setText] = useState("");
  const { sessionId, connected, addItem } = useClipboardStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!text.trim() || !sessionId || !connected) return;

    const socket = getSocket();
    socket.emit("clipboard-update", { text: text.trim() });

    addItem({
      type: "text",
      content: text.trim(),
      timestamp: Date.now(),
    });

    setText("");
    textareaRef.current?.focus();
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    // Let the textarea handle text paste naturally
    // Image paste is handled by ImageUploader
  };

  if (!connected) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Send Text
      </label>
      <div className="flex gap-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onPaste={handlePaste}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type or paste text to share…"
          rows={2}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="self-end px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          Send
        </button>
      </div>
    </div>
  );
}
