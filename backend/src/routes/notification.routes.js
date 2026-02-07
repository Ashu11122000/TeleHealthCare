import express from "express";
import { deleteNotificationController } from "../modules/notifications/notification.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * =========================
 * DELETE NOTIFICATION (SOFT)
 * =========================
 * DELETE /api/notifications/:notificationId
 */
router.delete(
  "/:notificationId",
  authMiddleware,
  deleteNotificationController
);

export default router;
