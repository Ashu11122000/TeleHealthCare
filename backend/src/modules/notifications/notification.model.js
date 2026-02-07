import { getPool } from "./../../config/db.js";

// Create Notification
export async function insertNotification({
    userId, 
    title,
    message,
    type = "SYSTEM"
}) {
    const pool = getPool();

    const sql = `
    INSERT INTO notifications
    (user_id, title, message, type)
    VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.query(sql, [
        userId, 
        title,
        message,
        type
    ]);

    return result.insertId;
}

// Fetch User Notifications
export async function fetchNotificationsByUser(userId, limit = 20) {
    const pool = getPool();

    const [rows] = await pool.query(
        `
        SELECT id, title, message, type, is_read, created_at
        FROM notifications
        WHERE user_id = ? 
        AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT ?
        `,
        [userId, limit]
    );

    return rows;
}

// Mark Notification as Read
export async function markNotificationRead(notificationId, userId) {
    const pool = getPool();

    const [result] = await pool.query(
        `
        UPDATE notifications
        SET is_read = TRUE
        WHERE id = ? AND user_id = ?
        `,
        [notificationId, userId]
    );

    return result.affectedRows > 0;
}

export async function softDeleteNotification(notificationId, userId){
    const pool = getPool();

    const [result] = await pool.query(
        `UPDATE notifications
        SET deleted_at = NOW()
        WHERE id = ? AND user_id = ?`,
        [notificationId, userId]
    );

    return result.affectedRows > 0;
}