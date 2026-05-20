"use client";

import { useEffect, useCallback, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useClipboardStore } from "@/store/useClipboardStore";
import { getSocket } from "@/lib/socket";
import { createSession, getSessionData } from "@/lib/api";
import { ClipboardItem } from "@/types";

export default function ConnectionPanel() {
  const {
    sessionId,
    deviceCount,
    connected,
    setSessionId,
    setDeviceCount,
    setConnected,
    setHistory,
    addItem,
  } = useClipboardStore();

  const [joinInput, setJoinInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const connectToSession = useCallback(
    (sid: string) => {
      const socket = getSocket();

      if (!socket.connected) {
        socket.connect();
      }

      socket.emit(
        "join-session",
        { sessionId: sid },
        (response: { success?: boolean; history?: ClipboardItem[]; deviceCount?: number; error?: string }) => {
          if (response.error) {
            setError(response.error);
            setLoading(false);
            return;
          }
          setSessionId(sid);
          setConnected(true);
          setHistory(response.history || []);
          setDeviceCount(response.deviceCount || 1);
          setError("");
          setLoading(false);

          // Persist sessionId to URL for easy sharing
          const url = new URL(window.location.href);
          url.searchParams.set("session", sid);
          window.history.replaceState({}, "", url.toString());
        }
      );

      // Listen for events
      socket.off("receive-clipboard");
      socket.on("receive-clipboard", (item: ClipboardItem) => {
        addItem(item);
      });

      socket.off("image-received");
      socket.on("image-received", (item: ClipboardItem) => {
        addItem(item);
      });

      socket.off("device-count");
      socket.on("device-count", ({ count }: { count: number }) => {
        setDeviceCount(count);
      });

      socket.off("disconnect");
      socket.on("disconnect", () => {
        setConnected(false);
      });

      socket.off("connect");
      socket.on("connect", () => {
        // Re-join session on reconnect
        socket.emit("join-session", { sessionId: sid }, () => {});
      });
    },
    [setSessionId, setConnected, setHistory, setDeviceCount, addItem, setError]
  );

  // Auto-join from URL query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session");
    if (sid && !sessionId) {
      setLoading(true);
      connectToSession(sid);
    }
  }, [sessionId, connectToSession]);

  const handleCreate = async () => {
    setLoading(true);
    setError("");
    try {
      const sid = await createSession();
      connectToSession(sid);
    } catch {
      setError("Failed to create session");
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    const sid = joinInput.trim();
    if (!sid) return;
    setLoading(true);
    setError("");

    const data = await getSessionData(sid);
    if (!data) {
      setError("Session not found");
      setLoading(false);
      return;
    }
    connectToSession(sid);
  };

  const getJoinUrl = () => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}?session=${sessionId}`;
  };

  // Connected state
  if (connected && sessionId) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <h2 className="text-lg font-semibold text-gray-900">Connected</h2>
          </div>
          <span className="text-sm text-gray-500">
            {deviceCount} device{deviceCount !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* QR Code */}
          <div className="bg-white p-3 rounded-lg border border-gray-100">
            <QRCodeSVG value={getJoinUrl()} size={140} level="M" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500 mb-2">
              Scan QR code or share this link to connect another device:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 truncate block">
                {getJoinUrl()}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(getJoinUrl())}
                className="shrink-0 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Session: <span className="font-mono">{sessionId.slice(0, 8)}…</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Disconnected state
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Connect Devices</h2>

      {error && (
        <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Create new session */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Start New Session</h3>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? "Connecting…" : "Create Session"}
          </button>
        </div>

        {/* Join existing session */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Join Existing Session</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={joinInput}
              onChange={(e) => setJoinInput(e.target.value)}
              placeholder="Paste session ID"
              className="flex-1 px-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            />
            <button
              onClick={handleJoin}
              disabled={loading || !joinInput.trim()}
              className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
