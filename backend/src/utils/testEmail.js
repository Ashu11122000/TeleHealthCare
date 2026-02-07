import { sendEmail } from "../modules/notifications/email.service.js";

await sendEmail({
    to: "patient@test.com",
    subject: "Test Email",
    body: "This is a test email"
});