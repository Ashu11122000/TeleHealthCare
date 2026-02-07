import { getPool } from "../../config/db.js";

/* 🔐 PHASE 11: AUDIT LOGGING */
import { auditLog } from "../audit/audit.service.js";
import { AUDIT_ACTIONS } from "../../constants/auditActions.js";

/**
 * =========================
 * GET PATIENT PROFILE
 * =========================
 */
export const getPatientProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = getPool();

    const [rows] = await pool.query(
      `SELECT age, gender, blood_group, allergies
       FROM patient_profiles
       WHERE user_id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.json({
        message: "Profile not created yet",
        profile: null,
      });
    }

    return res.json({
      profile: rows[0],
    });
  } catch (error) {
    console.error("GET PATIENT PROFILE ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch patient profile",
    });
  }
};

/**
 * =========================
 * CREATE OR UPDATE PATIENT PROFILE
 * =========================
 */
export const upsertPatientProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { age, gender, blood_group, allergies } = req.body;

    const pool = getPool();

    const [existing] = await pool.query(
      "SELECT id FROM patient_profiles WHERE user_id = ?",
      [userId]
    );

    if (existing.length === 0) {
      // CREATE
      await pool.query(
        `INSERT INTO patient_profiles
         (user_id, age, gender, blood_group, allergies)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, age, gender, blood_group, allergies]
      );
    } else {
      // UPDATE
      await pool.query(
        `UPDATE patient_profiles
         SET age = ?, gender = ?, blood_group = ?, allergies = ?
         WHERE user_id = ?`,
        [age, gender, blood_group, allergies, userId]
      );
    }

    /* 🧾 PHASE 11: AUDIT LOG */
    await auditLog({
      req,
      actionCode: AUDIT_ACTIONS.PROFILE_UPDATED,
      entityType: "PATIENT_PROFILE",
      entityId: userId,
      metadata: {
        updated_by: "patient",
      },
    });

    return res.json({
      message: "Patient profile saved successfully",
    });
  } catch (error) {
    console.error("UPSERT PATIENT PROFILE ERROR:", error);
    return res.status(500).json({
      message: "Failed to save patient profile",
    });
  }
};
