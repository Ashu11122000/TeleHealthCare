import express from "express";
const router = express.Router();

/**
 * ======================================================
 * IMPORT ACTIVE FEATURE ROUTES ONLY
 * ======================================================
 * IMPORTANT:
 * Do NOT import route files that do not exist yet.
 * ES Modules fail fast by design.
 */

// 🔐 Authentication & session
import authRoutes from "./auth.routes.js";

// 🧑‍🦱 Patient domain
import patientRoutes from "./patient.routes.js";

// 👨‍⚕️ Doctor domain (PHASE 6 + PHASE 12)
import doctorRoutes from "./doctor.routes.js";

// 📅 Appointments & availability
import appointmentRoutes from "./appointment.routes.js";

// 💬 Doctor–Patient chat (PHASE 8)
import chatRoutes from "./chat.routes.js";

// 🤖 AI Symptom Analysis (PHASE 9)
import aiRoutes from "./ai.routes.js";

// ✅ Consent (PHASE 10)
import consentRoutes from "./consent.routes.js";

// 🧾 Audit logs (PHASE 11)
import auditRoutes from "./audit.routes.js";

// Admin Logs
import adminRoutes from "./admin.routes.js";

import userRoutes from "./user.routes.js";

/**
 * ======================================================
 * REGISTER ROUTES
 * ======================================================
 */

// 🔐 Auth
router.use("/auth", authRoutes);

// 🧑 Patient
router.use("/patient", patientRoutes);

// 👨‍⚕️ Doctors  ✅ FIXED (plural)
router.use("/doctors", doctorRoutes);

// 📅 Appointments
router.use("/appointments", appointmentRoutes);

// 💬 Chat
router.use("/chat", chatRoutes);

// 🤖 AI
router.use("/ai", aiRoutes);

// ✅ Consent
router.use("/consent", consentRoutes);

// 🧾 Audit
router.use("/audit", auditRoutes);

// Admin
router.use("/admin", adminRoutes);

router.use("/users", userRoutes);

/**
 * ======================================================
 * HEALTH / TEST ROUTE
 * ======================================================
 */
router.get("/ping", (req, res) => {
  res.json({
    success: true,
    message: "✅ TeleHealth API index working",
    timestamp: new Date().toISOString()
  });
});

export default router;
