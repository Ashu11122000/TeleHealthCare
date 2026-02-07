import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

import { getAuditLogs } from "../modules/audit/audit.controller.js";

const router = express.Router();

/**
 * ADMIN - READ AUDIT LOGS
 */
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  getAuditLogs
);

export default router;
