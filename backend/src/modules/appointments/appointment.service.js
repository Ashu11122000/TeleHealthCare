import { getPool } from "../../config/db.js";
import { countAppointmentsByUser, fetchAppointmentsByUser } from "./appointment.job.js";
import { softDeleteAppointment } from "./appointment.job.js";

/**
 * BOOK APPOINTMENT (SAFE & IDEMPOTENT)
 */
export const bookAppointment = async ({
  patientId,
  doctorId,
  availabilityId,
  scheduledAt,
  idempotencyKey
}) => {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    /**
     * 1️⃣ Idempotency check
     */
    const [existing] = await connection.query(
      `SELECT * FROM appointments WHERE idempotency_key = ?`,
      [idempotencyKey]
    );

    if (existing.length) {
      await connection.commit();
      return existing[0];
    }

    /**
     * 2️⃣ Lock availability slot (CRITICAL)
     */
    const [slots] = await connection.query(
      `SELECT is_booked
       FROM doctor_availability
       WHERE id = ?
       FOR UPDATE`,
      [availabilityId]
    );

    if (!slots.length) {
      throw {
        status: 404,
        message: "Availability slot not found"
      };
    }

    if (slots[0].is_booked) {
      throw {
        status: 409,
        message: "This slot is already booked"
      };
    }

    /**
     * 3️⃣ Create appointment
     */
    const [result] = await connection.query(
      `INSERT INTO appointments
       (patient_id, doctor_id, availability_id, scheduled_at, status, idempotency_key)
       VALUES (?, ?, ?, ?, 'pending', ?)`,
      [
        patientId,
        doctorId,
        availabilityId,
        scheduledAt,
        idempotencyKey
      ]
    );

    /**
     * 4️⃣ Mark slot as booked
     */
    await connection.query(
      `UPDATE doctor_availability
       SET is_booked = TRUE
       WHERE id = ?`,
      [availabilityId]
    );

    await connection.commit();

    return {
      id: result.insertId,
      status: "pending"
    };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Get paginated appointments for patient or doctor
export async function getPaginatedAppointments({
  userId,
  role,
  limit,
  offset
}) {
  const total = await countAppointmentsByUser(userId, role);

  const appointments = await fetchAppointmentsByUser({
    userId,
    role,
    limit,
    offset
  });

  return { total, appointments };
  
};

export async function cancelAppointment({ appointmentId, userId }) {
  const deleted = await softDeleteAppointment({ appointmentId, userId });

  if(!deleted) {
    throw new Error(" Appointment not found or already cancelled ");
  }

  return true;
}