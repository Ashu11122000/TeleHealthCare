import { getPool } from './../../config/db.js';

export const insertConsent = async ({
    userId, 
    consentType, 
    version
}) => {
    const pool = getPool();

    const [result] = await pool.execute(
        `INSERT INTO consent_logs (user_id, consent_type, version, accepted)
        VALUES (?, ?, ?, TRUE)`,
        [userId, consentType, version]
    );

    return result.insertId;
};

export const getLatestConsentByType = async ({
    userId,
    consentType,
}) => {
    const pool = getPool();

    const [rows] = await pool.execute(
        `SELECT * 
        FROM consent_logs
        WHERE user_id = ?
        AND consent_type = ?
        ORDER BY created_at DESC
        LIMIT 1`,
        [userId, consentType]
    );

    return rows[0] || null;
};
