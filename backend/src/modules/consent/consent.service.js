import {
  insertConsent,
  getLatestConsentByType,
} from "./consent.model.js";
import { CONSENT_TYPES } from "../../constants/consentTypes.js";
import { CONSENT_VERSIONS } from "../../constants/consentVersions.js";

/**
 * Accept consent (generic)
 */
export const acceptConsent = async (userId, consentType) => {
  const version = CONSENT_VERSIONS[consentType];

  if (!version) {
    throw new Error("Invalid consent type");
  }

  return insertConsent({
    userId,
    consentType,
    version,
  });
};

/**
 * Check consent status
 */
export const checkConsentStatus = async (userId, consentType) => {
  const latest = await getLatestConsentByType({
    userId,
    consentType,
  });

  const requiredVersion = CONSENT_VERSIONS[consentType];

  if (!latest) {
    return {
      accepted: false,
      requiredVersion,
    };
  }

  const isValid = latest.version === requiredVersion;

  return {
    accepted: isValid,
    acceptedVersion: latest.version,
    requiredVersion,
  };
};
