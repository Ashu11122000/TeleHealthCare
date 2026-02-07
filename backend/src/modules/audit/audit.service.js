import { getPool } from "../../config/db.js";
import { countAuditLogs, fetchAuditLogs } from "./audit.model.js";

/**
 * WRITE AUDIT LOG
 */
export async function auditLog({
  userId = null,
  role = null,
  actionCode,
  entityType = null,
  entityId = null,
  metadata = {},
  ipAddress = null,
  userAgent = null
}) {
  const pool = getPool();

  const sql = `
    INSERT INTO audit_logs
    (
      user_id,
      role,
      action_code,
      entity_type,
      entity_id,
      metadata,
      ip_address,
      user_agent
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await pool.query(sql, [
    userId,
    role,
    actionCode,
    entityType,
    entityId,
    JSON.stringify(metadata),
    ipAddress,
    userAgent
  ]);
}

/**
 * READ AUDIT LOGS (ADMIN)
 */
export async function getPaginatedAuditLogs({ limit, offset }) {
  const total = await countAuditLogs();
  const logs = await fetchAuditLogs({ limit, offset });

  return { total, logs };
}
