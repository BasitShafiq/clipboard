"use client";

import { io, Socket } from "socket.io-client";

const getWsUrl = () => {
  if (typeof window === "undefined") return process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";
  return `${window.location.protocol}//${window.location.hostname}:3001`;
};

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(getWsUrl(), {
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
