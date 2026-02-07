/**
 * EMAIL SERVICE
 * -------------
 * Purpose: 
 * - This service is responsible only for sending emails
 * - It does not decide when to send emails
 * - It does not run in controllers directly
 * 
 * Send an email
 * 
 * @param {Object} payload
 * @param {string} payload.to      -Recipient email
 * @param {string} payload.subject -Email subject
 * @param {string} payload.body    -Email body (plain text for now)
 */

export async function sendEmail(payload) {
    const { to, subject, body } = payload;

    /**
     * Basic Validation
     * ----------------
     * Fail fast if payload is wrong
     */
    if(!to || !subject || !body) {
        throw new Error("Invalid email payload: to, subject, and body are required");
    }

    /**
     * DEVELOPMENT MODE
     * ----------------
     * We do not send real emails in development
     * This keeps the project:
     * - Free, safe and testable
     */
    if(process.env.NODE_ENV !=="production") {
        console.log("Email");
        console.log("To: ", to);
        console.log("Subject :", subject);
        console.log("Body :", body);
        console.log("=====================");
        return;
    }

    /**
   * =========================
   * PRODUCTION PLACEHOLDER
   * =========================
   * In future, replace this with:
   * - Nodemailer (SMTP)
   * - AWS SES
   * - SendGrid
   *
   * Example (NOT implemented now):
   * await transporter.sendMail(...)
   */

    throw new Error("Email provider not configured in production");
}

