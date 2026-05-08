const { Queue } = require("bullmq");
const { bullmqRedis } = require("./redis");

const connectionOpts = {
  connection: bullmqRedis,
};

/**
 * Queue for image processing jobs (compression, thumbnail generation).
 * Runs after upload completes so the API response stays fast.
 */
const imageQueue = new Queue("image-processing", connectionOpts);

/**
 * Queue for scheduled cleanup of expired image files from disk.
 */
const cleanupQueue = new Queue("image-cleanup", connectionOpts);

/**
 * Add an image compression job to the queue.
 */
async function addImageJob(data) {
  return imageQueue.add("compress", data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: true,
    removeOnFail: 50,
  });
}

/**
 * Add a delayed cleanup job that fires when the image expires.
 */
async function addCleanupJob(data, delayMs) {
  return cleanupQueue.add("delete-expired", data, {
    delay: delayMs,
    attempts: 2,
    removeOnComplete: true,
    removeOnFail: 50,
  });
}

/**
 * Schedule a repeatable sweep job that catches any orphaned files.
 * Runs every 2 minutes as a safety net.
 */
async function scheduleCleanupSweep() {
  await cleanupQueue.add(
    "sweep",
    {},
    {
      repeat: { every: 2 * 60 * 1000 }, // every 2 minutes
      removeOnComplete: true,
    }
  );
}

module.exports = {
  imageQueue,
  cleanupQueue,
  addImageJob,
  addCleanupJob,
  scheduleCleanupSweep,
};
