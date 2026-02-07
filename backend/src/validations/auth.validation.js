import { z } from "zod";
import Joi from 'joi';

export const registerSchema = {
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8).max(128),
    role: z.enum(["patient", "doctor"]).optional(), // NEVER allow admin
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
};

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

/**
 * =========================
 * SEND / RESEND OTP SCHEMA
 * =========================
 * Used for:
 * POST /api/auth/send-otp
 */
export const sendOtpSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
});


/**
 * =========================
 * VERIFY OTP SCHEMA
 * =========================
 * Used for:
 * POST /api/auth/verify-otp
 */
export const verifyOtpSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "Invalid email address",
      "any.required": "Email is required",
    }),

  otp: Joi.string()
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      "string.pattern.base": "OTP must be a 6-digit code",
      "any.required": "OTP is required",
    }),
});