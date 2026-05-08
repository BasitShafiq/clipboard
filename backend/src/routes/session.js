const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { createSession, getSession, touchSession } = require("../services/db");
const { getClipboardHistory } = require("../services/redis");

const router = express.Router();

/**
 * POST /session — Create a new session
 */
router.post("/", async (req, res) => {
  try {
    const id = uuidv4();
    await createSession(id);
    res.status(201).json({ sessionId: id });
  } catch (err) {
    console.error("Create session error:", err.message);
    res.status(500).json({ error: "Failed to create session" });
  }
});

/**
 * GET /session/:id — Get session info + clipboard history
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Basic UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: "Invalid session ID format" });
    }

    const session = await getSession(id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    await touchSession(id);
    const history = await getClipboardHistory(id);

    res.json({ session, history });
  } catch (err) {
    console.error("Get session error:", err.message);
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

module.exports = router;
