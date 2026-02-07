import { getPool } from "../../config/db.js";
import { auditLog } from "../audit/audit.service.js";
import { AUDIT_ACTIONS } from "../../constants/auditActions.js";
import { exportUserData } from "./user.service.js";

const pool = getPool();

export const deactivateMyAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await pool.query(
      `UPDATE users SET deleted_at = NOW() WHERE id = ?`,
      [userId]
    );

    await auditLog({
      req,
      actionCode: AUDIT_ACTIONS.USER_DEACTIVATED,
      entityType: "USER",
      entityId: userId
    });

    res.status(200).json({
      success: true,
      message: "Account deactivated successfully"
    });

  } catch (err) {
    next(err);
  }
};

export const exportMyData = async (req, res, next) => {
    try {
        const data = await exportUserData(req.user.id);
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
};