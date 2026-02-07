/**
 * Rule-based Symptom Severity Engine
 * ----------------------------------
 * Converts normalized symptom data into a risk score (0–100)
 * Deterministic, explainable, auditable
 */

const calculateSeverityScore = (severity) => {
  return Math.min((severity / 10) * 40, 40);
};

const calculateDurationScore = (durationDays) => {
  if (durationDays <= 1) return 5;
  if (durationDays <= 3) return 10;
  if (durationDays <= 7) return 18;
  return 25;
};

const calculateFrequencyScore = (frequency) => {
  switch (frequency) {
    case "rare":
      return 5;
    case "intermittent":
      return 10;
    case "continuous":
      return 15;
    default:
      return 0;
  }
};

const calculateAgeScore = (age) => {
  if (!age) return 0;
  if (age < 12) return 5;
  if (age < 40) return 2;
  if (age < 60) return 6;
  return 10;
};

const calculateRecurrenceScore = (previousEpisodes) => {
  return previousEpisodes ? 10 : 0;
};

/**
 * ✅ MAIN RULE ENGINE (NAMED EXPORT)
 */
export const calculateRiskScore = ({
  severity,
  duration_days,
  frequency,
  previous_episodes,
  age
}) => {
  const breakdown = {
    severity: calculateSeverityScore(severity),
    duration: calculateDurationScore(duration_days),
    frequency: calculateFrequencyScore(frequency),
    age: calculateAgeScore(age),
    recurrence: calculateRecurrenceScore(previous_episodes)
  };

  const totalScore = Object.values(breakdown).reduce(
    (sum, value) => sum + value,
    0
  );

  return {
    riskScore: Math.min(Math.round(totalScore), 100),
    breakdown
  };
};
