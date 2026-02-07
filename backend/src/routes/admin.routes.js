import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import { getAuditLogs } from "../modules/audit/audit.controller.js";

const router = express.Router();

/**
 * ADMIN: Read audit logs
 */
router.get(
  "/audit-logs",
  authMiddleware,
  roleMiddleware(["admin"]),
  getAuditLogs
);

export default router;
