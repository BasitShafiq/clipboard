require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const { Server } = require("socket.io");
const { initDB } = require("./services/db");
const { startCleanupJob } = require("./services/cleanup");
const { startWorkers } = require("./services/worker");
const { registerSocketHandlers } = require("./socket/handler");
const sessionRoutes = require("./routes/session");
const uploadRoutes = require("./routes/upload");

const PORT = parseInt(process.env.PORT || "3001", 10);
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
  },
  maxHttpBufferSize: 6e6, // 6MB
});

// Store io on app for access in routes
app.set("io", io);

// Middleware
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json({ limit: "1mb" }));

// Serve uploaded images as static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/session", sessionRoutes);
app.use("/upload-image", uploadRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Socket handlers
registerSocketHandlers(io);

// Start server
async function start() {
  try {
    await initDB();
    startWorkers();
    await startCleanupJob();

    server.listen(PORT, () => {
      console.log(`\n🚀 Clip backend running on http://localhost:${PORT}`);
      console.log(`   Frontend URL: ${FRONTEND_URL}\n`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

start();
