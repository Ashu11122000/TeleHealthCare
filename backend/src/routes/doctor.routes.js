import express from "express";
import authMiddleware from "./../middlewares/auth.middleware.js";
import roleMiddleware from "./../middlewares/role.middleware.js";

// Doctor profile
import {
  getDoctorProfile,
  upsertDoctorProfile,
  searchDoctors
} from "../modules/doctors/doctor.controller.js";

// Availability
import {
  createAvailability,
  getAvailability
} from "../modules/doctors/availability.controller.js";

// Appointments
import {
  getDoctorAppointments
} from "../modules/appointments/appointment.controller.js";

const router = express.Router();

/**
 * ============================
 * DOCTOR PROFILE
 * ============================
 */

// Get Doctor Profile
router.get(
  "/profile",
  authMiddleware,
  roleMiddleware(["doctor"]),
  getDoctorProfile
);

// Create / Update Doctor Profile
router.put(
  "/profile",
  authMiddleware,
  roleMiddleware(["doctor"]),
  upsertDoctorProfile
);

/**
 * ============================
 * DOCTOR AVAILABILITY
 * ============================
 */

// Create availability slot
router.post(
  "/availability",
  authMiddleware,
  roleMiddleware(["doctor"]),
  createAvailability
);

// Get doctor availability slots
router.get(
  "/availability",
  authMiddleware,
  roleMiddleware(["doctor"]),
  getAvailability
);

/**
 * ============================
 * DOCTOR APPOINTMENTS
 * ============================
 */

router.get(
  "/appointments",
  authMiddleware,
  roleMiddleware(["doctor"]),
  getDoctorAppointments
);

/**
 * ============================
 * DOCTOR SEARCH (PHASE 12)
 * ============================
 * Patient-only API
 */

router.get(
  "/search",
  authMiddleware,
  roleMiddleware(["patient"]),
  searchDoctors
);

export default router;
