import { z } from "zod";

/**
 * =========================
 * SEND CHAT MESSAGE
 * =========================
 */
export const sendMessageSchema = {
  body: z.object({
    conversation_id: z
      .number({
        required_error: "conversation_id is required",
        invalid_type_error: "conversation_id must be a number",
      })
      .int()
      .positive(),

    message: z
      .string({
        required_error: "message is required",
        invalid_type_error: "message must be a string",
      })
      .min(1, "message cannot be empty")
      .max(2000, "message is too long"),
  }),
};
