import { getPool } from "../../config/db.js";

export const findDoctors = async ({ specialization, availability }) => {
  const pool = getPool();

  let query = `
    SELECT
      u.id,
      u.name,
      d.specialization,
      d.experience_years,
      d.is_verified,
      COUNT(a.id) AS available_slots
    FROM users u
    JOIN doctor_profiles d ON d.user_id = u.id
    LEFT JOIN doctor_availability a
      ON a.doctor_id = u.id
      AND a.is_booked = FALSE
    WHERE u.role = 'doctor'
  `;

  const params = [];

  if (specialization) {
    query += " AND d.specialization = ?";
    params.push(specialization);
  }

  query += `
    GROUP BY
      u.id,
      u.name,
      d.specialization,
      d.experience_years,
      d.is_verified
  `;

  if (availability) {
    query += " HAVING available_slots > 0";
  }

  const [rows] = await pool.execute(query, params);
  return rows;
};
