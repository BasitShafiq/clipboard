const express = require("express");
const path = require("path");
const { upload, UPLOADS_DIR } = require("../middleware/upload");
const { trackImage, pushClipboardItem } = require("../services/redis");
const { getSession } = require("../services/db");
const { addImageJob, addCleanupJob } = require("../services/queue");

const router = express.Router();

/**
 * POST /upload-image — Upload an image for a session.
 * Expects multipart/form-data with fields: image (file), sessionId (string)
 */
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionId)) {
      return res.status(400).json({ error: "Invalid session ID format" });
    }

    const session = await getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const imageId = path.parse(req.file.filename).name;
    const expiryMinutes = parseInt(process.env.IMAGE_EXPIRY_MINUTES || "10", 10);
    const imageUrl = `/uploads/${req.file.filename}`;

    // Track in Redis for auto-cleanup
    await trackImage(imageId, req.file.path, expiryMinutes);

    // Queue async image compression (runs after response)
    await addImageJob({
      filePath: req.file.path,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      imageId,
    });

    // Schedule delayed cleanup job to delete file when it expires
    const delayMs = expiryMinutes * 60 * 1000;
    await addCleanupJob(
      {
        filePath: req.file.path,
        imageId,
        filename: req.file.filename,
      },
      delayMs
    );

    // Push to clipboard history
    const clipboardItem = {
      type: "image",
      imageUrl,
      imageId,
      filename: req.file.originalname,
    };
    await pushClipboardItem(sessionId, clipboardItem);

    // Emit Socket.IO event to session room
    const io = req.app.get("io");
    if (io) {
      io.to(sessionId).emit("image-received", {
        ...clipboardItem,
        timestamp: Date.now(),
      });
    }

    res.status(201).json({
      imageId,
      imageUrl,
      expiresInMinutes: expiryMinutes,
    });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

// Error handler for multer errors
router.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "File too large. Maximum size is 5MB." });
  }
  if (err.message && err.message.includes("Invalid file type")) {
    return res.status(415).json({ error: err.message });
  }
  next(err);
});

module.exports = router;
