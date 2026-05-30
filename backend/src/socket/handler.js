const { getClipboardHistory, pushClipboardItem } = require("../services/redis");
const { getSession, touchSession } = require("../services/db");

function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    /**
     * join-session: Device joins a session room.
     */
    socket.on("join-session", async ({ sessionId }, callback) => {
      try {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!sessionId || !uuidRegex.test(sessionId)) {
          return callback?.({ error: "Invalid session ID" });
        }

        const session = await getSession(sessionId);
        if (!session) {
          return callback?.({ error: "Session not found" });
        }

        socket.join(sessionId);
        socket.data.sessionId = sessionId;
        await touchSession(sessionId);

        // Send existing history to the joining device
        const history = await getClipboardHistory(sessionId);

        // Notify room about new device
        const roomSize = io.sockets.adapter.rooms.get(sessionId)?.size || 0;
        io.to(sessionId).emit("device-count", { count: roomSize });

        callback?.({ success: true, history, deviceCount: roomSize });
        console.log(`Socket ${socket.id} joined session ${sessionId} (${roomSize} devices)`);
      } catch (err) {
        console.error("join-session error:", err.message);
        callback?.({ error: "Failed to join session" });
      }
    });

    /**
     * clipboard-update: Device sends text to clipboard.
     */
    socket.on("clipboard-update", async ({ text }) => {
      const sessionId = socket.data.sessionId;
      if (!sessionId) return;

      if (typeof text !== "string" || text.length === 0 || text.length > 50000) {
        return;
      }

      try {
        const item = { type: "text", content: text };
        await pushClipboardItem(sessionId, item);

        // Broadcast to all OTHER devices in the session
        socket.to(sessionId).emit("receive-clipboard", {
          ...item,
          timestamp: Date.now(),
        });
      } catch (err) {
        console.error("clipboard-update error:", err.message);
      }
    });

    /**
     * disconnect: Clean up device count.
     */
    socket.on("disconnect", () => {
      const sessionId = socket.data.sessionId;
      if (sessionId) {
        const roomSize = io.sockets.adapter.rooms.get(sessionId)?.size || 0;
        io.to(sessionId).emit("device-count", { count: roomSize });
        console.log(`Socket ${socket.id} left session ${sessionId} (${roomSize} devices)`);
      }
    });
  });
}

module.exports = { registerSocketHandlers };
