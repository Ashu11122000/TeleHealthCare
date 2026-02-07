import { getPool } from "../../config/db.js";

/**
 * Count total audit logs
 */
export async function countAuditLogs() {
  const pool = getPool();

  const [rows] = await pool.query(
    "SELECT COUNT(*) AS total FROM audit_logs"
  );

  return rows[0].total;
}

/**
 * Fetch paginated audit logs
 */
export async function fetchAuditLogs({ limit, offset }) {
  const pool = getPool();

  const [rows] = await pool.query(
    `
    SELECT *
    FROM audit_logs
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
    `,
    [limit, offset]
  );

  return rows;
}
