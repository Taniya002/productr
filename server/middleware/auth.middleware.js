const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { errorResponse } = require("../utils/response.utils");

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return errorResponse(res, 401, "Access denied. No token provided.");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-__v");

    if (!user) {
      return errorResponse(res, 401, "User no longer exists.");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return errorResponse(res, 401, "Invalid token.");
    }
    if (error.name === "TokenExpiredError") {
      return errorResponse(res, 401, "Token expired. Please login again.");
    }
    return errorResponse(res, 500, "Authentication error.");
  }
};

module.exports = { protect };
