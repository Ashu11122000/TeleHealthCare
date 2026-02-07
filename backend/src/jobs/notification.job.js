import cron from "node-cron";
import { createNotification } from "../modules/notifications/notification.service.js";

// NOTIFICATION JOB
const notificationQueue = [];

// Queue a notification
export function queueNottification({
    userId,
    title,
    message,
    type
}) {
    notificationQueue.push({
        userId,
        title,
        message,
        type
    });
}

// Worker - runs after every 20 seconds
cron.schedule("*/20 * * * * *", async () => {
    if(notificationQueue.length === 0) {
        return;
    }

    console.log(` Notification Job: Processing ${notificationQueue.length} notification(s)`);

    while(notificationQueue.length > 0) {
        const job = notificationQueue.shift();

        try {
            await createNotification(job);
        } catch (error) {
            console.error("Notification Job Error:", error.message);
        }
    }
});