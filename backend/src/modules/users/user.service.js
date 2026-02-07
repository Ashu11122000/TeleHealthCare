import { getPool } from "./../../config/db.js";

export async function exportUserData(userId) {
  const pool = getPool();

  const [profile] = await pool.query(
    `SELECT * FROM users WHERE id = ?`,
    [userId]
  );

  const [appointments] = await pool.query(
    `SELECT * FROM appointments WHERE patient_id = ?`,
    [userId]
  );

  const [consents] = await pool.query(
    `SELECT * FROM consent_logs WHERE user_id = ?`,
    [userId]
  );

  return {
    profile: profile[0],
    appointments,
    consents
  };
}
