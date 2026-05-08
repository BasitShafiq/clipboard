const { scheduleCleanupSweep } = require("./queue");

/**
 * Start the BullMQ-based cleanup system.
 * - Individual images get a delayed cleanup job at upload time (see routes/upload.js)
 * - A repeatable sweep job runs every 2 minutes as a safety net for orphaned files
 */
async function startCleanupJob() {
  await scheduleCleanupSweep();
  console.log("✓ BullMQ cleanup sweep scheduled (every 2 min)");
}

module.exports = { startCleanupJob };
