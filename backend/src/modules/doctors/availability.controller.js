import { getPool } from "../../config/db.js";

// Create Doctor Availability
export const createAvailability = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const { date, start_time, end_time} = req.body;

        // 1. Validation
        if(!date || !start_time || !end_time) {
            return res.status(400).json({
                message: "date, start_time and end_time are required",
            });
        }

        const pool = getPool();

        // 2. Insert availability
        await pool.query(
            `INSERT INTO doctor_availability
            (doctor_id, date, start_time, end_time)
            VALUES(?,?,?,?)`,
            [doctorId, date, start_time, end_time]
        );

        return res.status(201).json({
            message: "Availability slot created succesfully",
        });
    } catch (error) {
        console.error("CREATE AVAILABILITY ERROR:", error);
        return res.status(500).json({
            message: "Failed to create availability",
        });
    }
};

// Get Doctor Availability
export const getAvailability = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const pool = getPool();

        const [rows] = await pool.query(
            `SELECT id, date, start_time, end_time, is_booked
            FROM doctor_availability
            WHERE doctor_id = ?
            ORDER BY date, start_time`,
            [doctorId]
        );

        return res.json({
            availability: rows,
        });
    } catch (error) {
        console.error("GET AVAILABILITY ERROR: ", error);
        return res.status(500).json({
            message: "Failed to fetch availability",
        });
    }
};