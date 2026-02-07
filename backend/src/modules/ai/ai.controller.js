import crypto from "crypto";

import { runAnalysis } from "./ai.service.js";
import { checkConsentStatus } from "../consent/consent.service.js";
import { CONSENT_TYPES } from "../../constants/consentTypes.js";
import { getCache, setCache } from "../../utils/cache.js";

export const analyzeSymptoms = async (req, res, next) => {
  try {
    const patientId = req.user.id;

    /**
     * STEP 1: Verify AI consent (Phase 10)
     */
    const consentStatus = await checkConsentStatus(
      patientId,
      CONSENT_TYPES.AI_ANALYSIS
    );

    if (!consentStatus.accepted) {
      return res.status(403).json({
        success: false,
        message: "AI consent required before symptom analysis",
        consentRequired: true,
        requiredVersion: consentStatus.requiredVersion
      });
    }

    /**
     * STEP 2: Build cache key (Phase 14.2)
     * Per patient + per exact symptom payload
     */
    const payloadHash = crypto
      .createHash("sha256")
      .update(JSON.stringify(req.body))
      .digest("hex");

    const cacheKey = `ai_analysis:${patientId}:${payloadHash}`;

    /**
     * STEP 3: Try cache first
     */
    const cached = getCache(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        data: cached,
        cached: true
      });
    }

    /**
     * STEP 4: Run AI analysis (Phase 9)
     */
    const result = await runAnalysis(patientId, req.body);

    /**
     * STEP 5: Cache final AI result (5 minutes)
     */
    setCache(cacheKey, result, 5 * 60_000);

    return res.status(200).json({
      success: true,
      data: result,
      cached: false
    });
  } catch (error) {
    next(error);
  }
};
