import express from "express";
import { validateRequest } from "../middlewares/validate.middleware.js";

import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyOtpSchema,          // ✅ OTP verify validation
  sendOtpSchema,            // ✅ OTP send validation
} from "../validations/auth.validation.js";

import {
  register,
  login,
  forgotPassword,
  resetPassword,
  sendOtp,                  // ✅ OTP send
  verifyOtp,                // ✅ OTP verify
} from "../modules/auth/auth.controller.js";

import {
  loginLimiter,
  registerLimiter,
} from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

/* ================= REGISTER ================= */
router.post(
  "/register",
  registerLimiter,
  validateRequest(registerSchema),
  register
);

/* ================= LOGIN ================= */
router.post(
  "/login",
  loginLimiter,
  validateRequest(loginSchema),
  login
);

/* ================= SEND / RESEND OTP ================= */
router.post(
  "/send-otp",
  validateRequest(sendOtpSchema),
  sendOtp
);

/* ================= VERIFY OTP ================= */
router.post(
  "/verify-otp",
  validateRequest(verifyOtpSchema),
  verifyOtp
);

/* ================= FORGOT PASSWORD ================= */
router.post(
  "/forgot-password",
  validateRequest(forgotPasswordSchema),
  forgotPassword
);

/* ================= RESET PASSWORD ================= */
router.post(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  resetPassword
);

export default router;
