const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

// Separate connection for BullMQ — requires maxRetriesPerRequest: null
const bullmqRedis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});


redis.on("error", (err) => {
  console.error("Redis connection error:", err.message);
});

redis.on("connect", () => {
  console.log("✓ Redis connected");
});


/**
 * Get clipboard history for a session.
 */
async function getClipboardHistory(sessionId) {
  const key = `clipboard:${sessionId}`;
  const items = await redis.lrange(key, 0, -1);
  console.log("Clipboard history for session", sessionId, items);
  return items.map((item) => JSON.parse(item));
}



/**
 * Push a clipboard item and trim to max history.
 */
async function pushClipboardItem(sessionId, item) {
  const maxItems = parseInt(process.env.MAX_HISTORY_ITEMS || "10", 10);
  const key = `clipboard:${sessionId}`;
  const serialized = JSON.stringify({ ...item, timestamp: Date.now() });
  await redis.lpush(key, serialized);
  await redis.ltrim(key, 0, maxItems - 1);
  // Expire the entire list after 24 hours
  await redis.expire(key, 86400);
}


/**
 * Track an uploaded image for auto-cleanup.
 */
async function trackImage(imageId, filePath, expiryMinutes) {
  const expiresAt = Date.now() + expiryMinutes * 60 * 1000;
  await redis.set(
    `image:${imageId}`,
    JSON.stringify({ filePath, expiresAt }),
    "EX",
    expiryMinutes * 60
  );
}

/**
 * Get image metadata.
 */
async function getImageMeta(imageId) {
  const data = await redis.get(`image:${imageId}`);
  return data ? JSON.parse(data) : null;
}

module.exports = { redis, bullmqRedis, getClipboardHistory, pushClipboardItem, trackImage, getImageMeta };
