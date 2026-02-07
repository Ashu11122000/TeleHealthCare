import rateLimit from "express-rate-limit";

// Generic error message (security-safe)
const rateLimitResponse = {
  success: false,
  message: "Too many requests. Please try again later.",
};

// AUTH - Login (Brute Force Protection)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    //10 attempts
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json(rateLimitResponse);
  },
});

// AUTH - Register (abuse protection)
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 5,
  handler: (req, res) => {
    res.status(429).json(rateLimitResponse);
  },
});

// AI - Symptom Analysis (CPU Heavy)
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  handler: (req, res) =>{
    res.status(429).json({
    success: false,
    message: "AI rate limit exceeded. Please wait before retrying.",

  });
},
});

// Chat - Message Sending (Spam Protection)
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 30,
  handler: (req, res) => {
    res.status(429).json(rateLimitResponse);
  },
});

/**
 * APPOINTMENTS — Booking / Reschedule
 * (race-condition & abuse protection)
 */
export const bookingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3,              // max 3 booking attempts
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many booking attempts. Please wait before retrying.",
    });
  },
});
