import express from "express";

import { analyzeSymptoms } from "../modules/ai/ai.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import { aiLimiter } from "../middlewares/rateLimit.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { sanitizeRequest } from "../middlewares/sanitize.middleware.js";
import { aiAnalyzeSchema } from "../validations/ai.validation.js";
const router = express.Router();

/**
 * POST /ai/analyze
 * Patient-only AI symtom analysis
 */
router.post(
  "/analyze",
  aiLimiter,
  authMiddleware,
  roleMiddleware(["patient"]),
  validateRequest(aiAnalyzeSchema),
  sanitizeRequest,
  analyzeSymptoms
);


export default router;