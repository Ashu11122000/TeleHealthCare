/**
 * AI Explainability Engine
 * ------------------------
 * Generates safe, human-readable explanations
 * without providing medical diagnoses
 */

const BASE_TEMPLATES = {
  LOW: "Your reported symptoms appear to be mild based on the information provided.",
  MEDIUM: "Your symptoms show a moderate pattern that may benefit from medical attention.",
  HIGH: "Your symptoms indicate a high-risk pattern that should be evaluated by a healthcare professional.",
  EMERGENCY: "Your symptoms match patterns that may require immediate medical attention."
};

const generateContributingFactors = (breakdown) => {
  const factors = [];

  if (breakdown.severity >= 25) {
    factors.push("High symptom severity");
  }

  if (breakdown.duration >= 15) {
    factors.push("Symptoms lasting multiple days");
  }

  if (breakdown.frequency >= 10) {
    factors.push("Frequent or continuous symptoms");
  }

  if (breakdown.age >= 8) {
    factors.push("Age-related risk factor");
  }

  if (breakdown.recurrence > 0) {
    factors.push("Previous similar episodes");
  }

  return factors;
};

const generateExplainabilityScore = (riskScore, factors) => {
  return Math.min(
    60 + factors.length * 8 + Math.floor(riskScore / 5),
    100
  );
};

/**
 * ✅ Named export (IMPORTANT)
 */
export const generateExplanation = ({
  riskLevel,
  riskScore,
  breakdown,
  redFlags = []
}) => {
  if (riskLevel === "EMERGENCY") {
    return {
      summary: BASE_TEMPLATES.EMERGENCY,
      contributingFactors: redFlags.map((f) => f.description),
      disclaimer:
        "This system does not provide medical diagnoses. Please seek immediate professional care.",
      explainabilityScore: 100
    };
  }

  const contributingFactors = generateContributingFactors(breakdown);

  return {
    summary: BASE_TEMPLATES[riskLevel],
    contributingFactors,
    disclaimer:
      "This information is for educational purposes only and is not a medical diagnosis.",
    explainabilityScore: generateExplainabilityScore(
      riskScore,
      contributingFactors
    )
  };
};
