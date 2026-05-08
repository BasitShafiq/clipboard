const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const UPLOADS_DIR = path.join(__dirname, "../../uploads");

// Ensure uploads dir exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || "5", 10) * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const id = crypto.randomUUID();
    const ext = path.extname(file.originalname).toLowerCase() || ".png";
    cb(null, `${id}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PNG, JPG, JPEG, and WebP are allowed."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
});

module.exports = { upload, UPLOADS_DIR };
