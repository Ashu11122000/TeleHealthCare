/**
 * ======================================================
 * EXPRESS APPLICATION SETUP
 * ======================================================
 */

import express from "express";
import helmet from "helmet";
import corsMiddleware from "./config/cors.js";

// 🔗 Central API router
import apiRoutes from "./routes/index.js";

// ⚙️ Security
import rateLimiter from "./config/rateLimit.js";

// ❗ Global error handler
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

/**
 * ======================================================
 * GLOBAL SECURITY MIDDLEWARES
 * ======================================================
 */

// Secure HTTP headers
app.use(helmet());

// ✅ SINGLE, EXPLICIT CORS MIDDLEWARE (NO WILDCARD)
app.use(corsMiddleware);

// ✅ SAFE preflight handler (Express v5 compatible)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// Global rate limiter
app.use(rateLimiter);

/**
 * ======================================================
 * BODY PARSERS
 * ======================================================
 */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/**
 * ======================================================
 * API ROUTES
 * ======================================================
 */

app.use("/api", apiRoutes);

/**
 * ======================================================
 * HEALTH CHECK
 * ======================================================
 */

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "TeleHealth Backend",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

/**
 * ======================================================
 * GLOBAL ERROR HANDLER
 * ======================================================
 */

app.use(errorHandler);

export default app;
