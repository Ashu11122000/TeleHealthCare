import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import {
  getPatientProfile,
  upsertPatientProfile,
} from "../modules/patients/patient.controller.js";
import { bookAppointment } from "../modules/appointments/appointment.controller.js";

const router = express.Router();

// GET patient profile
router.get(
  "/profile",
  authMiddleware,
  roleMiddleware(["patient"]),
  getPatientProfile
);

// CREATE / UPDATE patient profile
router.put(
  "/profile",
  authMiddleware,
  roleMiddleware(["patient"]),
  upsertPatientProfile
);

router.post(
  "/appointments",
  authMiddleware,
  roleMiddleware(["patient"]),
  bookAppointment
);

export default router;
