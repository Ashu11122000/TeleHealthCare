import { getPool } from "../../config/db.js";

import { calculateRiskScore } from "../symptoms/ruleEngine.js";
import { detectRedFlags } from "../symptoms/redFlagDetector.js";
import { classifyRisk } from "./riskClassifier.js";
import { generateExplanation } from "./explainability.js";

export const runAnalysis = async (patientId, input) => {
  const pool = getPool();

  /**
   * 1️⃣ Check AI consent
   */
  const [consents] = await pool.query(
    `
    SELECT id
    FROM consent_logs
    WHERE user_id = ?
      AND consent_type = 'AI_ANALYSIS'
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [patientId]
  );

  if (!consents.length) {
    throw new Error("AI consent not provided");
  }

  /**
   * 2️⃣ Fetch patient age
   */
  const [[profile]] = await pool.query(
    `SELECT age FROM patient_profiles WHERE user_id = ?`,
    [patientId]
  );

  /**
   * 3️⃣ Store symptom report
   */
  const [symptomResult] = await pool.query(
    `
    INSERT INTO symptom_reports
      (
        patient_id,
        body_part,
        symptoms,
        severity,
        duration_days,
        frequency,
        triggers,
        previous_episodes,
        normalized_data
      )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      patientId,
      input.body_part,
      JSON.stringify(input.symptoms),
      input.severity,
      input.duration_days,
      input.frequency,
      JSON.stringify(input.triggers || []),
      input.previous_episodes,
      JSON.stringify(input.normalized_data || {})
    ]
  );

  const symptomReportId = symptomResult.insertId;

  /**
   * 4️⃣ Red flag detection
   */
  const redFlagResult = detectRedFlags({
    symptoms: input.symptoms,
    body_part: input.body_part,
    severity: input.severity,
    duration_days: input.duration_days
  });

  if (redFlagResult.hasRedFlag) {
    for (const flag of redFlagResult.flags) {
      await pool.query(
        `
        INSERT INTO red_flag_events
          (symptom_report_id, flag_code, description)
        VALUES (?, ?, ?)
        `,
        [symptomReportId, flag.code, flag.description]
      );
    }
  }

  /**
   * 5️⃣ Risk score (skip if emergency)
   */
  let riskScoreResult = { riskScore: 0, breakdown: {} };

  if (!redFlagResult.hasRedFlag) {
    riskScoreResult = calculateRiskScore({
      severity: input.severity,
      duration_days: input.duration_days,
      frequency: input.frequency,
      previous_episodes: input.previous_episodes,
      age: profile?.age
    });
  }

  /**
   * 6️⃣ Risk classification
   */
  const riskClassification = classifyRisk({
    riskScore: riskScoreResult.riskScore,
    hasRedFlag: redFlagResult.hasRedFlag
  });

  /**
   * 7️⃣ Explanation generation
   */
  const explanation = generateExplanation({
    riskLevel: riskClassification.riskLevel,
    riskScore: riskScoreResult.riskScore,
    breakdown: riskScoreResult.breakdown,
    redFlags: redFlagResult.flags
  });

  /**
   * 8️⃣ Store AI decision
   */
  await pool.query(
    `
    INSERT INTO ai_decisions
      (
        symptom_report_id,
        risk_score,
        risk_level,
        confidence_score,
        contributing_factors,
        explanation,
        rule_weight,
        heuristic_weight
      )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      symptomReportId,
      riskScoreResult.riskScore,
      riskClassification.riskLevel,
      riskClassification.confidence,
      JSON.stringify(explanation.contributingFactors),
      explanation.summary,
      0.7,
      0.3
    ]
  );

  /**
   * 9️⃣ Return final response
   */
  return {
    symptomReportId,
    risk: riskClassification,
    explanation
  };
};
