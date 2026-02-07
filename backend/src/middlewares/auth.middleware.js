// src/middlewares/auth.middleware.js
import jwt from "jsonwebtoken";
import { getPool } from "../config/db.js";

const authMiddleware = async (req, res, next) => {
  try {
    /**
     * 1️⃣ Read Authorization header
     */
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization header missing",
      });
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        message: "Invalid authorization format",
      });
    }

    /**
     * 2️⃣ Verify JWT
     */
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /**
     * 3️⃣ Lazy DB access (IMPORTANT)
     */
    const pool = getPool();

    const [rows] = await pool.query(
      `
      SELECT id, email, role, deleted_at
      FROM users
      WHERE id = ?
      `,
      [decoded.id]
    );

    if (!rows.length) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    const user = rows[0];

    /**
     * 4️⃣ Soft-delete enforcement
     */
    if (user.deleted_at && user.role !== "admin") {
      return res.status(403).json({
        message: "Account is deactivated",
      });
    }

    /**
     * 5️⃣ Attach user to request
     */
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    console.error("AUTH ERROR:", err.message);
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

export default authMiddleware;
