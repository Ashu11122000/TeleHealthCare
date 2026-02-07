import express from "express";

import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

import {
  createConversationController,
  getConversationController,
  sendMessageController,
} from "../modules/chat/chat.controller.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { sanitizeRequest } from "../middlewares/sanitize.middleware.js";
import { sendMessageSchema } from "../validations/chat.validation.js";
import { chatLimiter } from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

/**
 * =========================
 * CREATE CONVERSATION
 * (PATIENT ONLY)
 * =========================
 */
router.post(
  "/conversations",
  authMiddleware,
  roleMiddleware(["patient"]),
  createConversationController
);

/**
 * =========================
 * GET CONVERSATION
 * (PATIENT / DOCTOR / ADMIN)
 * =========================
 */
router.get(
  "/conversations/:id",
  authMiddleware,
  getConversationController
);

/**
 * =========================
 * SEND MESSAGE
 * (PATIENT / DOCTOR)
 * =========================
 */
router.post(
  "/messages",
  chatLimiter,
  validateRequest(sendMessageSchema),
  sanitizeRequest,
  authMiddleware,
  sendMessageController
);

export default router;
