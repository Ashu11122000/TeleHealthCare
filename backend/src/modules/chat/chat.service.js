import { getPool } from "../../config/db.js";

/**
 * ======================================================
 * INTERNAL SAFE NUMBER PARSER
 * ======================================================
 */
const toSafeNumber = (value, fieldName) => {
  const num = Number(value);

  if (Number.isNaN(num)) {
    throw new Error(`${fieldName} must be a valid number`);
  }

  return num;
};

/**
 * ======================================================
 * CREATE CONVERSATION (PATIENT ONLY)
 * ======================================================
 */
export const createConversation = async (patientId, appointmentId) => {
  const pool = getPool();

  const safePatientId = toSafeNumber(patientId, "patientId");
  const safeAppointmentId = toSafeNumber(appointmentId, "appointmentId");

  // Validate appointment ownership
  const [[appointment]] = await pool.query(
    `
    SELECT id, doctor_id
    FROM appointments
    WHERE id = ? AND patient_id = ?
    `,
    [safeAppointmentId, safePatientId]
  );

  if (!appointment) {
    throw new Error("Invalid appointment or access denied");
  }

  // One conversation per appointment
  const [[existing]] = await pool.query(
    `SELECT id FROM conversations WHERE appointment_id = ?`,
    [safeAppointmentId]
  );

  if (existing) {
    return { id: existing.id };
  }

  // Create conversation
  const [result] = await pool.query(
    `
    INSERT INTO conversations (patient_id, doctor_id, appointment_id)
    VALUES (?, ?, ?)
    `,
    [safePatientId, appointment.doctor_id, safeAppointmentId]
  );

  return { id: result.insertId };
};

/**
 * ======================================================
 * GET CONVERSATION + MESSAGES
 * ======================================================
 */
export const getConversation = async (user, conversationId) => {
  const pool = getPool();

  const safeConversationId = toSafeNumber(conversationId, "conversationId");
  const safeUserId = toSafeNumber(user.id, "userId");

  const [[conversation]] = await pool.query(
    `SELECT * FROM conversations WHERE id = ?`,
    [safeConversationId]
  );

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const allowed =
    user.role === "admin" ||
    safeUserId === conversation.patient_id ||
    safeUserId === conversation.doctor_id;

  if (!allowed) {
    throw new Error("Access denied");
  }

  const [messages] = await pool.query(
    `
    SELECT id, sender_id, message, created_at
    FROM messages
    WHERE conversation_id = ?
    ORDER BY created_at ASC
    `,
    [safeConversationId]
  );

  return { conversation, messages };
};

/**
 * ======================================================
 * SEND MESSAGE
 * ======================================================
 */
export const sendMessage = async (user, conversationId, message) => {
  const pool = getPool();

  const safeConversationId = toSafeNumber(conversationId, "conversationId");
  const safeUserId = toSafeNumber(user.id, "userId");

  if (!message || typeof message !== "string") {
    throw new Error("Message content is required");
  }

  const [[conversation]] = await pool.query(
    `SELECT * FROM conversations WHERE id = ?`,
    [safeConversationId]
  );

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  if (
    safeUserId !== conversation.patient_id &&
    safeUserId !== conversation.doctor_id
  ) {
    throw new Error("Not allowed to send message");
  }

  const [result] = await pool.query(
    `
    INSERT INTO messages (conversation_id, sender_id, message)
    VALUES (?, ?, ?)
    `,
    [safeConversationId, safeUserId, message.trim()]
  );

  return {
    id: result.insertId,
    conversation_id: safeConversationId,
    sender_id: safeUserId,
    message: message.trim()
  };
};
