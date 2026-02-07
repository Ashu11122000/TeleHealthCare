import cron from "node-cron";
import { getPool } from "../config/db.js";

/**
 * AUDIT LOG CLEANUP JOB
 * ---------------------
 * Retention: 2 years
 */
cron.schedule("0 2 * * *", async () => {
    try {
        const pool = getPool();

        const [result] = await pool.query(`
            DELETE FROM audit_logs
            WHERE created_at < NOW() - INTERVAL 2 YEAR
            `);

            console.log(`Audit Cleanup: Removed ${result.affectedRows} old log(s)`);
    } catch (error) {
        console.error("Audit Cleanup Job Error:", error.message);
    }
});