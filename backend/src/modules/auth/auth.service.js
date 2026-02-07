import bcrypt from "bcryptjs";
import { findUserByEmail, createUser } from "./auth.model.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import { auditLog } from "../audit/audit.service.js";
import { AUDIT_ACTIONS } from "../../constants/auditActions.js";

/**
 * REGISTER USER
 */
export const registerUser = async (req) => {
  const { name, email, password, role } = req.body;

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const userId = await createUser({
    name,
    email,
    password: hashedPassword,
    role
  });

  return {
    message: "Registration successful",
    userId
  };
};

/**
 * LOGIN USER
 */
export const loginUser = async (req) => {
  const { email, password } = req.body;

  const user = await findUserByEmail(email);

  // ❌ Email not found
  if (!user) {
    await auditLog({
      req,
      actionCode: AUDIT_ACTIONS.LOGIN_FAILURE,
      entityType: "USER",
      metadata: {
        email,
        reason: "EMAIL_NOT_FOUND"
      }
    });

    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  // ❌ Password mismatch
  if (!isPasswordValid) {
    await auditLog({
      req,
      actionCode: AUDIT_ACTIONS.LOGIN_FAILURE,
      entityType: "USER",
      entityId: user.id,
      metadata: {
        email,
        reason: "INVALID_PASSWORD"
      }
    });

    throw new Error("Invalid credentials");
  }

  // ✅ SUCCESS
  const payload = {
    id: user.id,
    role: user.role
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Attach user to req so audit can read role/id
  req.user = payload;

  await auditLog({
    req,
    actionCode: AUDIT_ACTIONS.LOGIN_SUCCESS,
    entityType: "USER",
    entityId: user.id,
    metadata: {
      email: user.email
    }
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};
