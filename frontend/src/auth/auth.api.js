import axios from "axios";

/**
 * Central Auth API client
 * (Interceptors will be attached later)
 */
const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true, // future-ready (cookies / refresh)
});

/* ------------------------------------------------------------------
   AUTHENTICATION
------------------------------------------------------------------ */

/**
 * Login
 * POST /api/auth/login
 */
export const loginApi = (credentials) => {
  return api.post("/api/auth/login", credentials);
};

/**
 * Register
 * POST /api/auth/register
 */
export const registerApi = (data) => {
  return api.post("/api/auth/register", data);
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refreshTokenApi = (refreshToken) => {
  return api.post("/api/auth/refresh", { refreshToken });
};

/* ------------------------------------------------------------------
   OTP (Email / Security Verification)
------------------------------------------------------------------ */

/**
 * Send / Resend OTP
 * POST /api/auth/otp/send
 */
export const sendOtpApi = ({ email }) => {
  return api.post("/api/auth/otp/send", { email });
};

/**
 * Verify OTP
 * POST /api/auth/otp/verify
 */
export const verifyOtpApi = ({ email, otp }) => {
  return api.post("/api/auth/otp/verify", { email, otp });
};

/* ------------------------------------------------------------------
   PASSWORD RECOVERY (future-ready)
------------------------------------------------------------------ */

/**
 * Forgot password
 * POST /api/auth/forgot-password
 */
export const forgotPasswordApi = ({ email }) => {
  return api.post("/api/auth/forgot-password", { email });
};

/**
 * Reset password
 * POST /api/auth/reset-password
 */
export const resetPasswordApi = (data) => {
  return api.post("/api/auth/reset-password", data);
};

export default api;
