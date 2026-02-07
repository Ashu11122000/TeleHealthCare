import {
  acceptConsent,
  checkConsentStatus,
} from "./consent.service.js";
import { CONSENT_TYPES } from "../../constants/consentTypes.js";

/**
 * POST /consent/ai
 */
export const acceptAIConsent = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await acceptConsent(userId, CONSENT_TYPES.AI_ANALYSIS);

    res.json({
      success: true,
      message: "AI consent recorded successfully",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /consent/status
 */
export const getConsentStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const aiConsent = await checkConsentStatus(
      userId,
      CONSENT_TYPES.AI_ANALYSIS
    );

    res.json({
      success: true,
      data: {
        aiAnalysis: aiConsent,
      },
    });
  } catch (err) {
    next(err);
  }
};
