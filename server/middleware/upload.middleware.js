const multer = require("multer");
const { errorResponse } = require("../utils/response.utils");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and WebP images are allowed."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
});

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return errorResponse(res, 400, "File size must be less than 5MB.");
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return errorResponse(res, 400, "Maximum 5 images allowed.");
    }
    return errorResponse(res, 400, err.message);
  }
  if (err) {
    return errorResponse(res, 400, err.message);
  }
  next();
};

module.exports = { upload, handleMulterError };
