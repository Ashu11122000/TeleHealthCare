import express from "express";

import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import { bookingLimiter } from "../middlewares/rateLimit.middleware.js";

import {
  bookAppointment,
  updateAppointmentStatus,
  getMyAppointments,
  cancelAppointment
} from "../modules/appointments/appointment.controller.js";

const router = express.Router();

/**
 * =========================
 * BOOK APPOINTMENT
 * =========================
 * POST /api/appointments
 * Access: Patient
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["patient"]),
  bookingLimiter,
  bookAppointment
);

/**
 * =========================
 * GET MY APPOINTMENTS
 * =========================
 * GET /api/appointments
 * Access:
 * - Patient → own appointments
 * - Doctor  → own appointments
 */
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["patient", "doctor"]),
  getMyAppointments
);

/**
 * =========================
 * UPDATE APPOINTMENT STATUS
 * =========================
 * PATCH /api/appointments/:id/status
 * Access: Doctor / Admin
 */
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware(["doctor", "admin"]),
  updateAppointmentStatus
);

/**
 * =========================
 * CANCEL APPOINTMENT (SOFT DELETE)
 * =========================
 * DELETE /api/appointments/:appointmentId
 * Access: Patient
 */
router.delete(
  "/:appointmentId",
  authMiddleware,
  roleMiddleware(["patient"]),
  cancelAppointment
);

export default router;
