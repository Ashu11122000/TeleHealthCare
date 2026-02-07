/**
 * bcrypt -> Password hashing (one-way, secure)
 * jwt -> Token generation (stateless authentication)
 * crypto -> Secure random token generation
 * getPool -> Lazy MySQL pool creator (ESM safe)
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

/* 🔐 PHASE 11: AUDIT LOGGING */
import { auditLog } from "../audit/audit.service.js";
import { AUDIT_ACTIONS } from "../../constants/auditActions.js";
import { getPool } from "../../config/db.js";
import { generateOtp, hashOtp, getOtpExpiry } from "./otp.service.js";

/**
 * =========================
 * REGISTER CONTROLLER
 * =========================
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const allowedRoles = ["patient", "doctor"];
    const userRole = allowedRoles.includes(role) ? role : "patient";

    const pool = getPool();

    const [existingUser] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES (?, ?, ?, ?)`,
      [name, email, hashedPassword, userRole]
    );

    req.user = { id: result.insertId, role: userRole };

    await auditLog({
      req,
      actionCode: AUDIT_ACTIONS.PROFILE_CREATED,
      entityType: "USER",
      entityId: result.insertId,
      metadata: { email, role: userRole },
    });

    return res.status(201).json({
      success: true,
      role: userRole,
      message: "User registered successfully",
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ message: "Registration failed" });
  }
};

/**
 * =========================
 * LOGIN CONTROLLER
 * =========================
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const pool = getPool();

    const [users] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      await auditLog({
        req,
        actionCode: AUDIT_ACTIONS.LOGIN_FAILURE,
        entityType: "USER",
        metadata: { email, reason: "EMAIL_NOT_FOUND" },
      });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      await auditLog({
        req,
        actionCode: AUDIT_ACTIONS.LOGIN_FAILURE,
        entityType: "USER",
        entityId: user.id,
        metadata: { email, reason: "INVALID_PASSWORD" },
      });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "365d" }
    );

    req.user = { id: user.id, role: user.role };

    await auditLog({
      req,
      actionCode: AUDIT_ACTIONS.LOGIN_SUCCESS,
      entityType: "USER",
      entityId: user.id,
      metadata: { email: user.email },
    });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: "Login failed" });
  }
};

/**
 * =========================
 * FORGOT PASSWORD CONTROLLER (NEW)
 * =========================
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const pool = getPool();

    // 1️⃣ Find user (silent failure)
    const [users] = await pool.query(
      "SELECT id, role FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.json({
        message: "If the email exists, a reset link has been sent",
      });
    }

    const user = users[0];

    // 2️⃣ Generate secure token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // 3️⃣ Store token with expiry (15 minutes)
    await pool.query(
      `
      INSERT INTO password_resets (user_id, token_hash, expires_at)
      VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))
      `,
      [user.id, tokenHash]
    );

    // 4️⃣ Audit log
    req.user = { id: user.id, role: user.role };

    await auditLog({
      req,
      actionCode: AUDIT_ACTIONS.PASSWORD_RESET_REQUESTED,
      entityType: "USER",
      entityId: user.id,
      metadata: { email },
    });

    // 5️⃣ DEV MODE: log token (replace with email service in prod)
    console.log("🔑 PASSWORD RESET TOKEN (DEV):", rawToken);

    return res.json({
      message: "If the email exists, a reset link has been sent",
    });

  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return res.status(500).json({
      message: "Failed to process forgot password request",
    });
  }
};

/**
 * =========================
 * RESET PASSWORD CONTROLLER
 * =========================
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const pool = getPool();

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const [rows] = await pool.query(
      `
      SELECT pr.id, pr.user_id, pr.expires_at, pr.used, u.email, u.role
      FROM password_resets pr
      JOIN users u ON u.id = pr.user_id
      WHERE pr.token_hash = ?
      `,
      [tokenHash]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        message: "Invalid or expired reset link",
      });
    }

    const reset = rows[0];

    if (reset.used || new Date(reset.expires_at) < new Date()) {
      return res.status(400).json({
        message: "Reset link has expired",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, reset.user_id]
    );

    await pool.query(
      "UPDATE password_resets SET used = TRUE WHERE user_id = ?",
      [reset.user_id]
    );

    req.user = { id: reset.user_id, role: reset.role };

    await auditLog({
      req,
      actionCode: AUDIT_ACTIONS.PASSWORD_RESET_COMPLETED || "PASSWORD_RESET_COMPLETED",
      entityType: "USER",
      entityId: reset.user_id,
      metadata: { email: reset.email },
    });

    return res.json({
      success: true,
      message: "Password reset successful",
    });

  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return res.status(500).json({
      message: "Failed to reset password",
    });
  }
};

/**
 * =========================
 * SEND / RESEND OTP
 * =========================
 */
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const pool = getPool();

    const [users] = await pool.query(
      "SELECT id, role FROM users WHERE email = ?",
      [email]
    );

    // Silent success (anti-enumeration)
    if (users.length === 0) {
      return res.json({ success: true });
    }

    const user = users[0];

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = getOtpExpiry();

    // Invalidate previous OTPs
    await pool.query(
      "UPDATE email_otps SET used = TRUE WHERE user_id = ?",
      [user.id]
    );

    // Store new OTP
    await pool.query(
      `
      INSERT INTO email_otps (user_id, otp_hash, expires_at)
      VALUES (?, ?, ?)
      `,
      [user.id, otpHash, expiresAt]
    );

    // 🔐 DEV ONLY (remove in production)
    console.log("🔑 OTP (DEV):", otp);

    req.user = { id: user.id, role: user.role };

    await auditLog({
      req,
      actionCode: AUDIT_ACTIONS.OTP_SENT,
      entityType: "USER",
      entityId: user.id,
      metadata: { email },
    });

    return res.json({ success: true });

  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

/**
 * =========================
 * VERIFY OTP
 * =========================
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const pool = getPool();

    const [users] = await pool.query(
      "SELECT id, role FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({
        message: "Invalid or expired code",
      });
    }

    const user = users[0];
    const otpHash = hashOtp(otp);

    const [rows] = await pool.query(
      `
      SELECT id, expires_at, used
      FROM email_otps
      WHERE user_id = ? AND otp_hash = ?
      `,
      [user.id, otpHash]
    );

    if (
      rows.length === 0 ||
      rows[0].used ||
      new Date(rows[0].expires_at) < new Date()
    ) {
      return res.status(400).json({
        message: "Invalid or expired code",
      });
    }

    // Mark OTP as used
    await pool.query(
      "UPDATE email_otps SET used = TRUE WHERE id = ?",
      [rows[0].id]
    );

    req.user = { id: user.id, role: user.role };

    await auditLog({
      req,
      actionCode: AUDIT_ACTIONS.OTP_VERIFIED,
      entityType: "USER",
      entityId: user.id,
      metadata: { email },
    });

    return res.json({ success: true });

  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    return res.status(500).json({ message: "OTP verification failed" });
  }
};