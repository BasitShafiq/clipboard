"use client";

import { create } from "zustand";
import { ClipboardItem } from "@/types";

interface ClipboardState {
  sessionId: string | null;
  deviceCount: number;
  connected: boolean;
  history: ClipboardItem[];
  setSessionId: (id: string | null) => void;
  setDeviceCount: (count: number) => void;
  setConnected: (connected: boolean) => void;
  setHistory: (items: ClipboardItem[]) => void;
  addItem: (item: ClipboardItem) => void;
}

export const useClipboardStore = create<ClipboardState>((set) => ({
  sessionId: null,
  deviceCount: 0,
  connected: false,
  history: [],

  setSessionId: (id) => set({ sessionId: id }),
  setDeviceCount: (count) => set({ deviceCount: count }),
  setConnected: (connected) => set({ connected }),
  setHistory: (items) => set({ history: items }),

  addItem: (item) =>
    set((state) => ({
      history: [item, ...state.history].slice(0, 10),
    })),
}));
