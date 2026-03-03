import multer from "multer";

const storage = multer.memoryStorage();
//multer puts files in RAM: req.files = [{ buffer, mimetype, originalname, ... }, ...]

function fileFilter(req, file, cb) {
  const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
  cb(ok ? null : new Error("Only image files (jpg/png/webp) are allowed."), ok);
}

export const uploadReceipts = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 6 }, // up to 6 images, 5MB each
}).array("receipts", 6);