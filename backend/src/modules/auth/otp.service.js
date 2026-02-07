import crypto from "crypto";

/**
 * Generate numeric OTP
 */
export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash OTP before storing
 */
export const hashOtp = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

/**
 * OTP expiry (10 minutes)
 */
export const getOtpExpiry = () => {
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + 10);
  return expires;
};
