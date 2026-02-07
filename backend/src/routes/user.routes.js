import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import { exportMyData, deactivateMyAccount } from "../modules/users/user.controller.js";

const router = express.Router();

// Test route: only PATIENT can access
router.get(
  "/patient-area",
  authMiddleware,
  roleMiddleware(["patient"]),
  (req, res) => {
    res.json({
      message: "Welcome Patient",
      user: req.user,
    });
  }
);

// Test route: only DOCTOR can access
router.get(
  "/doctor-area",
  authMiddleware,
  roleMiddleware(["doctor"]),
  (req, res) => {
    res.json({
      message: "Welcome Doctor",
      user: req.user,
    });
  }
);

/**
 * EXPORT MY DATA
 * GET /api/users/me/export
 */
router.get(
  "/me/export",
  authMiddleware,
  exportMyData
);

/**
 * DEACTIVATE ACCOUNT
 * DELETE /api/users/me
 */
router.delete(
  "/me",
  authMiddleware,
  deactivateMyAccount
);

export default router;
