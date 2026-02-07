/**
 * Red Flag Detection Engine
 * -------------------------
 * Detects life-threatening symptom combinations.
 * If a red flag is found, normal AI flow must stop.
 */

const RED_FLAGS = [
  {
    code: "RF001",
    description: "Chest pain with shortness of breath",
    match: ({ symptoms }) =>
      symptoms.includes("chest_pain") &&
      symptoms.includes("shortness_of_breath")
  },
  {
    code: "RF002",
    description: "Severe headache with vision problems",
    match: ({ symptoms, severity }) =>
      symptoms.includes("headache") &&
      symptoms.includes("vision_loss") &&
      severity >= 7
  },
  {
    code: "RF003",
    description: "High fever with neck stiffness",
    match: ({ symptoms, severity }) =>
      symptoms.includes("fever") &&
      symptoms.includes("neck_stiffness") &&
      severity >= 7
  },
  {
    code: "RF004",
    description: "Sudden weakness with speech difficulty",
    match: ({ symptoms }) =>
      symptoms.includes("sudden_weakness") &&
      symptoms.includes("speech_difficulty")
  },
  {
    code: "RF005",
    description: "Abdominal pain with vomiting blood",
    match: ({ symptoms }) =>
      symptoms.includes("abdominal_pain") &&
      symptoms.includes("vomiting_blood")
  }
];

/**
 * ✅ Named export (IMPORTANT for ES Modules)
 */
export const detectRedFlags = (data) => {
  const triggeredFlags = RED_FLAGS.filter((flag) =>
    flag.match(data)
  );

  return {
    hasRedFlag: triggeredFlags.length > 0,
    flags: triggeredFlags
  };
};
