import { getPool } from "../../config/db.js";

/* 🔐 PHASE 11: AUDIT LOGGING */
import { auditLog } from "../audit/audit.service.js";
import { AUDIT_ACTIONS } from "../../constants/auditActions.js";

/* 🧠 PHASE 12 + 14.2: DOCTOR SEARCH */
import { searchDoctors as searchDoctorsService } from "./doctor.service.js";
import { getCache, setCache } from "../../utils/cache.js";

/**
 * =========================
 * GET DOCTOR PROFILE
 * =========================
 * Access: Doctor
 */
export const getDoctorProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = getPool();

    const [rows] = await pool.query(
      `
      SELECT
        qualification,
        specialization,
        experience_years,
        languages,
        consultation_fee
      FROM doctor_profiles
      WHERE user_id = ?
      `,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(200).json({
        message: "Doctor profile not created yet",
        profile: null
      });
    }

    return res.status(200).json({
      profile: rows[0]
    });
  } catch (error) {
    console.error("GET DOCTOR PROFILE ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch doctor profile"
    });
  }
};

/**
 * =========================
 * CREATE / UPDATE DOCTOR PROFILE
 * =========================
 * Access: Doctor
 */
export const upsertDoctorProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      qualification,
      specialization,
      experience_years,
      languages,
      consultation_fee
    } = req.body;

    const pool = getPool();

    const [existing] = await pool.query(
      "SELECT id FROM doctor_profiles WHERE user_id = ?",
      [userId]
    );

    if (existing.length === 0) {
      await pool.query(
        `
        INSERT INTO doctor_profiles
        (user_id, qualification, specialization, experience_years, languages, consultation_fee)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          userId,
          qualification,
          specialization,
          experience_years,
          languages,
          consultation_fee
        ]
      );
    } else {
      await pool.query(
        `
        UPDATE doctor_profiles
        SET
          qualification = ?,
          specialization = ?,
          experience_years = ?,
          languages = ?,
          consultation_fee = ?
        WHERE user_id = ?
        `,
        [
          qualification,
          specialization,
          experience_years,
          languages,
          consultation_fee,
          userId
        ]
      );
    }

    await auditLog({
      userId,
      role: "doctor",
      actionCode: AUDIT_ACTIONS.PROFILE_UPDATED,
      entityType: "DOCTOR_PROFILE",
      entityId: userId,
      metadata: {
        updatedFields: Object.keys(req.body)
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });

    return res.status(200).json({
      message: "Doctor profile saved successfully"
    });
  } catch (error) {
    console.error("UPSERT DOCTOR PROFILE ERROR:", error);
    return res.status(500).json({
      message: "Failed to save doctor profile"
    });
  }
};

/**
 * =========================
 * SEARCH DOCTORS
 * (PHASE 12 + PHASE 14.2 CACHING)
 * =========================
 * GET /api/doctors/search
 * Access: Patient
 */
export const searchDoctors = async (req, res, next) => {
  try {
    const cacheKey = `doctor_search:${JSON.stringify(req.query)}`;

    const cached = getCache(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        ...cached,
        cached: true
      });
    }

    const filters = {
      specialization: req.query.specialization,
      riskLevel: req.query.risk,
      availability: req.query.available === "true"
    };

    const doctors = await searchDoctorsService(filters);

    const response = { data: doctors };

    setCache(cacheKey, response, 60_000);

    return res.status(200).json({
      success: true,
      ...response,
      cached: false
    });
  } catch (error) {
    console.error("SEARCH DOCTORS ERROR:", error);
    next(error);
  }
};
