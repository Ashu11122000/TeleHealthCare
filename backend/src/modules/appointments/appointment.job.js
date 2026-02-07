import { getPool } from "./../../config/db.js";

export async function getAppointmentsByUser({ userId, role, limit, offset }) {
  const pool = getPool();

  const column = role === "doctor" ? "doctor_id" : "patient_id";

  const [rows] = await pool.query(
    `
    SELECT * 
    FROM appointments
    WHERE ${column} = ?
    AND deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
    `,
    [userId, limit, offset]
  );

  return rows;
}

export const markNoShows = async () => {
  const pool = getPool();

  await pool.query(`
    UPDATE appointments
    SET status = 'no_show'
    WHERE status = 'confirmed'
    AND TIMESTAMPDIFF(MINUTE, scheduled_at, NOW()) > 15
  `);
};

// Count appointments for logged-in user
export async function countAppointmentsByUser(userId, role) {
  const pool = getPool();
  const column = role === "doctor" ? "doctor_id":"patient_id";

  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total FROM appointments
    WHERE ${column} = ? AND deleted_at IS NULL`,
    [userId]
  );

  return rows[0].total;
}

// Fetch paginated appointments for logged-in user
export async function fetchAppointmentsByUser({
  userId,
  role,
  limit,
  offset
}) {
  const pool = getPool();
  const column = role === "doctor" ? "doctor_id" : "patient_id";

  const [rows] = await pool.query(
    `
    SELECT * FROM appointments
    WHERE ${column} = ? AND deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );

  return rows;
}

export async function softDeleteAppointment({ appointmentId, userId }) {
  const pool = getPool();
  
  const [result] = await pool.query(
    `
    UPDATE appointments
    SET deleted_at = NOW()
    WHERE id = ?
    AND patient_id = ?
    AND deleted_at IS NULL
    `,
    [appointmentId, userId]
  );

  return result.affectedRows > 0;
}