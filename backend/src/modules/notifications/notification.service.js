import { insertNotification, fetchNotificationsByUser, markNotificationRead } from "./notification.model.js";
import { softDeleteNotification } from "./notification.model.js";

/**
 * CREATE NOTIFICATION
 * -------------------
 * Called by background jobs
 */
export async function createNotification({
    userId, 
    title,
    message,
    type
}) {
    if(!userId || !title || !message) {
        throw new Error("Invalid notification payload")
    }

    return insertNotification({
        userId, 
        title,
        message,
        type
    });
};

/**
 * Get User Notifications
 * ----------------------
 * Called by controllers
 */
export async function getUserNotifications(userId, limit) {
    return fetchNotificationsByUser(userId, limit);
};

// Mark as read
export async function markAsRead(notificationId, userId) {
    const updated = await markNotificationRead(notificationId, userId);

    if(!updated) {
        throw new Error("Notification not found or access denied");
    }

    return true;
};

export async function deleteNotification(notificationId, userId) {
    const deleted = await softDeleteNotification(notificationId, userId);

    if(!deleted) {
        throw new Error("Notification not found");
    }

    return true;
}