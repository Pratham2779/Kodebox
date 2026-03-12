import multer from "multer";
import path from "node:path";
import fs from "fs";
import { randomUUID } from "crypto";

const uploadDir = path.resolve("public/temp");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {

    const original = path.basename(file.originalname || "file");
    const ext = path.extname(original).toLowerCase();
    const name = `${Date.now()}-${randomUUID()}${ext}`;
    cb(null, name);
  },
});

const uploadAvatarImage = multer({
  storage,
  limits: { fileSize: 16 * 1024 * 1024 }, // 16MB
  fileFilter: (req, file, cb) => {

    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/svg+xml",
    ];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, WEBP, SVG files are allowed"));
    }
  },
});

const parseFormDataOnly = multer().none();

export { uploadAvatarImage, parseFormDataOnly };
