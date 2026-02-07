import { getPool } from "../../config/db.js";

/* 🔐 PHASE 11: AUDIT LOGGING */
import { auditLog } from "../audit/audit.service.js";
import { AUDIT_ACTIONS } from "../../constants/auditActions.js";

/* 🧠 Pagination */
import { getPagination, buildPaginationMeta } from "../../utils/pagination.js";

/* 🧠 Services */
import {
  getPaginatedAppointments,
  cancelAppointment as cancelAppointmentService
} from "./appointment.service.js";

import { v4 as uuidv4 } from "uuid";

const pool = getPool();

/**
 * =========================
 * BOOK APPOINTMENT (PATIENT)
 * =========================
 */
export const bookAppointment = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { availability_id, scheduled_at } = req.body;
    const patientId = req.user.id;

    if (!availability_id || !scheduled_at) {
      return res.status(400).json({
        message: "availability_id and scheduled_at are required"
      });
    }

    const idempotencyKey =
      req.headers["idempotency-key"] || uuidv4();

    await connection.beginTransaction();

    const [existing] = await connection.query(
      `SELECT * FROM appointments WHERE idempotency_key = ?`,
      [idempotencyKey]
    );

    if (existing.length > 0) {
      await connection.commit();
      return res.status(200).json({
        message: "Appointment already booked",
        appointment: existing[0]
      });
    }

    const [availability] = await connection.query(
      `
      SELECT * FROM doctor_availability
      WHERE id = ?
      FOR UPDATE
      `,
      [availability_id]
    );

    if (!availability.length) {
      throw { status: 404, message: "Availability slot not found" };
    }

    if (availability[0].is_booked) {
      throw { status: 409, message: "Slot already booked" };
    }

    const doctorId = availability[0].doctor_id;

    const [result] = await connection.query(
      `
      INSERT INTO appointments
      (patient_id, doctor_id, availability_id, scheduled_at, status, idempotency_key)
      VALUES (?, ?, ?, ?, 'pending', ?)
      `,
      [
        patientId,
        doctorId,
        availability_id,
        scheduled_at,
        idempotencyKey
      ]
    );

    const appointmentId = result.insertId;

    await connection.query(
      `UPDATE doctor_availability SET is_booked = 1 WHERE id = ?`,
      [availability_id]
    );

    await auditLog({
      req,
      actionCode: AUDIT_ACTIONS.APPOINTMENT_CREATED,
      entityType: "APPOINTMENT",
      entityId: appointmentId
    });

    await connection.commit();

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment_id: appointmentId
    });

  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * =========================
 * GET MY APPOINTMENTS
 * =========================
 * Patient → own
 * Doctor  → own
 */
export const getMyAppointments = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);

    const { total, appointments } =
      await getPaginatedAppointments({
        userId: req.user.id,
        role: req.user.role,
        limit,
        offset
      });

    res.status(200).json({
      data: appointments,
      pagination: buildPaginationMeta({ page, limit, total })
    });
  } catch (err) {
    next(err);
  }
};

/**
 * =========================
 * BACKWARD COMPAT (TEMP)
 * =========================
 * Used by doctor.routes.js
 * Internally delegates to getMyAppointments
 */
export const getDoctorAppointments = getMyAppointments;

/**
 * =========================
 * UPDATE APPOINTMENT STATUS
 * =========================
 */
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "confirmed",
      "cancelled",
      "completed",
      "no_show"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const [rows] = await pool.query(
      `SELECT status FROM appointments WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const oldStatus = rows[0].status;

    await pool.query(
      `UPDATE appointments SET status = ? WHERE id = ?`,
      [status, id]
    );

    await auditLog({
      req,
      actionCode: AUDIT_ACTIONS.APPOINTMENT_STATUS_CHANGED,
      entityType: "APPOINTMENT",
      entityId: id,
      metadata: { from: oldStatus, to: status }
    });

    res.status(200).json({
      message: "Appointment status updated successfully"
    });

  } catch (err) {
    next(err);
  }
};

/**
 * =========================
 * CANCEL APPOINTMENT (SOFT DELETE)
 * =========================
 */
export const cancelAppointment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { appointmentId } = req.params;

    await cancelAppointmentService({ appointmentId, userId });

    await auditLog({
      userId,
      role: req.user.role,
      actionCode: AUDIT_ACTIONS.APPOINTMENT_SOFT_DELETED,
      entityType: "APPOINTMENT",
      entityId: appointmentId
    });

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully"
    });
  } catch (err) {
    next(err);
  }
};
