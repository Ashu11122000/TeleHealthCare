/**
 * ======================================================
 * SERVER ENTRY POINT
 * ======================================================
 * Responsibilities:
 * 1. Load environment variables
 * 2. Verify database connectivity
 * 3. Start HTTP server
 * 4. Schedule background jobs
 * 5. Handle graceful shutdown
 */

import dotenv from "dotenv";
dotenv.config();

console.log("🔥 SERVER ENTRY (src/server.js) LOADED");

// Core app
import app from "./app.js";

// Database
import { getPool } from "./config/db.js";

// Cron (Phase 13)
import cron from "node-cron";
import { markNoShows } from "./modules/appointments/appointment.job.js";
import { cleanupExpiredData } from "./jobs/dataRentention.job.js";

// Port
const PORT = process.env.PORT || 5000;

/**
 * ======================================================
 * BOOTSTRAP SERVER
 * ======================================================
 */
const startServer = async () => {
  try {
    /**
     * 1️⃣ Verify database connectivity (FAIL FAST)
     */
    const pool = getPool();
    const connection = await pool.getConnection();
    console.log("✅ MySQL connected successfully");
    connection.release();

    /**
     * 2️⃣ Start HTTP server
     */
    const server = app.listen(PORT, () => {
      console.log(
        `🚀 TeleHealth Backend running on port ${PORT} (${process.env.NODE_ENV || "development"})`
      );
    });

    /**
     * 3️⃣ PHASE 13 — No-Show / Grace-Period Job
     *
     * Runs every 5 minutes
     * ⚠️ recoverMissedExecutions: false
     * → Prevents replaying missed cron runs
     * → Eliminates warning spam
     * → Production-safe behaviour
     */
    cron.schedule(
      "*/5 * * * *",
      async () => {
        try {
          await markNoShows();
        } catch (err) {
          console.error("❌ No-show cron job failed:", err.message);
        }
      },
      {
        scheduled: true,
        recoverMissedExecutions: false,
      }
    );

    console.log("⏱ No-show cron scheduled (every 5 minutes)");

    cron.schedule("0 3 * * *", cleanupExpiredData);

    /**
     * 4️⃣ Graceful shutdown
     */
    const shutdown = (signal) => {
      console.log(`⚠️ Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log("🛑 HTTP server closed");
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
};

// Start server
startServer();
