import express from "express";
import {
  acceptAIConsent,
  getConsentStatus,
} from "../modules/consent/consent.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

router.post(
  "/ai",
  authMiddleware,
  roleMiddleware(["patient"]),
  acceptAIConsent
);

router.get(
  "/status",
  authMiddleware,
  getConsentStatus
);

export default router;
