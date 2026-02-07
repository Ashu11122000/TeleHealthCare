import { getPagination, buildPaginationMeta } from "../../utils/pagination.js";
import { getPaginatedAuditLogs } from "./audit.service.js";

/**
 * ADMIN: Read audit logs (paginated)
 * READ-ONLY endpoint
 */
export async function getAuditLogs(req, res, next) {
  try {
    const { page, limit, offset } = getPagination(req.query);

    const { total, logs } = await getPaginatedAuditLogs({ limit, offset });

    res.status(200).json({
      data: logs,
      pagination: buildPaginationMeta({ page, limit, total })
    });
  } catch (err) {
    next(err);
  }
}
