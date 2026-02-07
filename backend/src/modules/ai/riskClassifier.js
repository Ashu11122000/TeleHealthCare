/**
 * Risk Classification Engine
 * --------------------------
 * Converts numeric score + red-flag outcome
 * into a human-readable risk level.
 */

export const classifyRisk = ({ riskScore, hasRedFlag }) => {
  // 🚨 Emergency override
  if (hasRedFlag) {
    return {
      riskLevel: "EMERGENCY",
      color: "red",
      confidence: 1.0
    };
  }

  if (riskScore <= 30) {
    return {
      riskLevel: "LOW",
      color: "green",
      confidence: Math.min(0.6 + riskScore / 100, 0.75)
    };
  }

  if (riskScore <= 65) {
    return {
      riskLevel: "MEDIUM",
      color: "yellow",
      confidence: Math.min(0.7 + riskScore / 100, 0.85)
    };
  }

  return {
    riskLevel: "HIGH",
    color: "orange",
    confidence: Math.min(0.8 + riskScore / 100, 0.95)
  };
};
