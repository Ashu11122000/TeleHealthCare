import { z } from "zod";

/**
 * =========================
 * AI SYMPTOM ANALYSIS
 * =========================
 */
export const aiAnalyzeSchema = {
  body: z.object({
    body_part: z.string().min(2).max(50),

    symptoms: z
      .array(z.string().min(2).max(100))
      .min(1, "At least one symptom is required"),

    severity: z
      .number()
      .int()
      .min(1)
      .max(10),

    duration_days: z
      .number()
      .int()
      .min(0)
      .max(365),

    frequency: z.string().min(2).max(30).optional(),

    triggers: z.array(z.string()).optional(),

    previous_episodes: z.boolean().optional(),
  }),
};
