require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const { errorMiddleware, notFound } = require("./middleware/error.middleware");

connectDB();

const app = express();
app.set("trust proxy", 1);
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests. Please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many OTP requests. Please wait 10 minutes." },
});

app.use(limiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/", (req, res) => {
  res.json({ success: true, message: "Productr API is running." });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/products", productRoutes);

app.use(notFound);
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
