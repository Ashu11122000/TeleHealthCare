import cron from "node-cron";
import { sendEmail } from "../modules/notifications/email.service.js";

/**
 * EMAIL JOB (BACKGROUND)
 * ----------------------
 * - In-memory queue
 * - Controllers/services push jobs
 * - Cron processes them asynchronously
 */
const emailQueue = [];

/**
 * Queue an email
 * Called from services / controllers
 */
export function queueEmail({ to, subject, body}) {
    emailQueue.push({ to, subject, body });
}

// Worker - runs every 30 seconds
cron.schedule("*/30 * * * * *", async() => {
    if(emailQueue.length === 0) return;

    console.log(`Email Job: Processing ${emailQueue.length} email(s)`);

    while(emailQueue.length > 0) {
        const email = emailQueue.shift();

        try {
            await sendEmail(email);
        } catch (error) {
            console.error("Email Job Error:", error.message);
        }
    }
});