import { getPool } from "../config/db.js";

export async function cleanupExpiredData() {
    const pool = getPool();

    await pool.query(`
        DELETE FROM appointments
        WHERE deleted_at IS NOT NULL
        AND deleted_at < NOW() - INTERVAL 2 YEAR
    `);

    await pool.query(`
        DELETE FROM users
        WHERE deleted_at IS NOT NULL
        AND deleted_at < NOW() - INTERVAL 30 DAY
    `);

    console.log("Data retention cleanup completed");
}