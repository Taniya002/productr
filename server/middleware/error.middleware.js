const { errorResponse } = require("../utils/response.utils");

const errorMiddleware = (err, req, res, next) => {
  console.error(`[Error] ${err.message}`);

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((e) => e.message).join(", ");
    return errorResponse(res, 400, message);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return errorResponse(res, 400, `${field} already exists.`);
  }

  if (err.name === "CastError") {
    return errorResponse(res, 400, "Invalid ID format.");
  }

  return errorResponse(res, err.statusCode || 500, err.message || "Internal Server Error");
};

const notFound = (req, res) => {
  return errorResponse(res, 404, `Route ${req.originalUrl} not found.`);
};

module.exports = { errorMiddleware, notFound };
