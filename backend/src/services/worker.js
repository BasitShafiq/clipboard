const { Worker } = require("bullmq");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { bullmqRedis } = require("./redis");

const UPLOADS_DIR = path.join(__dirname, "../../uploads");

const connectionOpts = { connection: bullmqRedis };

/**
 * Worker: image-processing
 * Compresses uploaded images using sharp to reduce size and generate
 * optimized versions. Runs asynchronously after the upload API responds.
 */
const imageWorker = new Worker(
  "image-processing",
  async (job) => {
    const { filePath, filename, mimetype } = job.data;

    if (!fs.existsSync(filePath)) {
      console.log(`⚠ Image file not found, skipping: ${filename}`);
      return { skipped: true };
    }

    const ext = path.extname(filename).toLowerCase();
    const tempPath = filePath + ".tmp";

    try {
      let pipeline = sharp(filePath);

      // Resize if wider than 1920px (keep aspect ratio)
      const metadata = await pipeline.metadata();
      if (metadata.width && metadata.width > 1920) {
        pipeline = pipeline.resize(1920, null, { withoutEnlargement: true });
      }

      // Compress based on format
      if (ext === ".png") {
        pipeline = pipeline.png({ quality: 80, compressionLevel: 8 });
      } else if (ext === ".webp") {
        pipeline = pipeline.webp({ quality: 80 });
      } else {
        // jpg/jpeg
        pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
      }

      // Write to temp file, then replace original (atomic-ish)
      await pipeline.toFile(tempPath);

      const originalSize = fs.statSync(filePath).size;
      const compressedSize = fs.statSync(tempPath).size;

      // Only replace if compression actually helped
      if (compressedSize < originalSize) {
        fs.renameSync(tempPath, filePath);
        const saved = Math.round((1 - compressedSize / originalSize) * 100);
        console.log(`✓ Compressed ${filename}: ${saved}% smaller (${originalSize} → ${compressedSize} bytes)`);
        return { compressed: true, savedPercent: saved };
      } else {
        fs.unlinkSync(tempPath);
        console.log(`✓ Skipped compression for ${filename} (already optimal)`);
        return { compressed: false, reason: "already optimal" };
      }
    } catch (err) {
      // Clean up temp file on error
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      throw err;
    }
  },
  {
    ...connectionOpts,
    concurrency: 2,
  }
);

/**
 * Worker: image-cleanup
 * Handles two job types:
 * - "delete-expired": Deletes a specific image file after its TTL expires
 * - "sweep": Scans uploads dir and removes any orphaned files (safety net)
 */
const cleanupWorker = new Worker(
  "image-cleanup",
  async (job) => {
    if (job.name === "delete-expired") {
      const { filePath, imageId, filename } = job.data;

      // Double-check Redis — if key still exists, image was re-uploaded or extended
      const meta = await redis.get(`image:${imageId}`);
      if (meta) {
        return { skipped: true, reason: "key still exists" };
      }

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑 Deleted expired image: ${filename}`);
        return { deleted: true };
      }

      return { skipped: true, reason: "file not found" };
    }

    if (job.name === "sweep") {
      if (!fs.existsSync(UPLOADS_DIR)) return { swept: 0 };

      let deleted = 0;
      const files = fs.readdirSync(UPLOADS_DIR);

      for (const file of files) {
        const imageId = path.parse(file).name;
        const meta = await redis.get(`image:${imageId}`);

        if (!meta) {
          fs.unlinkSync(path.join(UPLOADS_DIR, file));
          console.log(`🗑 Sweep: cleaned orphaned file ${file}`);
          deleted++;
        }
      }

      console.log(`✓ Sweep complete: ${deleted} files cleaned`);
      return { swept: deleted };
    }
  },
  {
    ...connectionOpts,
    concurrency: 1,
  }
);

// Log worker errors
imageWorker.on("failed", (job, err) => {
  console.error(`✗ Image job ${job?.id} failed:`, err.message);
});

cleanupWorker.on("failed", (job, err) => {
  console.error(`✗ Cleanup job ${job?.id} failed:`, err.message);
});

function startWorkers() {
  console.log("✓ BullMQ workers started (image-processing, image-cleanup)");
}

module.exports = { imageWorker, cleanupWorker, startWorkers };
