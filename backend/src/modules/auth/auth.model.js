import { getPool } from "../../config/db.js";

export const findUserByEmail = async (email) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  return rows[0];
};

export const createUser = async ({ name, email, password, role }) => {
  const pool = getPool();
  const [result] = await pool.execute(
    `
    INSERT INTO users (name, email, password, role)
    VALUES (?, ?, ?, ?)
    `,
    [name, email, password, role]
  );
  return result.insertId;
};
