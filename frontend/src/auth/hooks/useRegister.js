import { useState } from "react";
import { registerApi } from "../auth.api";

/**
 * useRegister — Phase 18 (Healthcare-grade)
 *
 * Responsibilities:
 * - Call register API
 * - Normalize backend errors into calm, user-safe messages
 * - NEVER expose raw axios errors to UI
 * - Return structured result for flow control (OTP, redirect, etc.)
 */
export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const register = async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const res = await registerApi(payload);

      /**
       * Expected backend response (example):
       * {
       *   role: "patient",
       *   requiresOtp: true
       * }
       */

      return {
        success: true,
        role: res.data?.role,
        requiresOtp: res.data?.requiresOtp ?? false,
        email: payload.email,
      };
    } catch (err) {
      /**
       * Axios error normalization (UX-safe)
       */
      const status = err?.response?.status;
      const message = err?.response?.data?.message;

      if (status === 409) {
        setError(
          "An account with this email already exists. Please sign in instead."
        );
      } else if (status === 400) {
        setError(
          message || "Please check your details and try again."
        );
      } else {
        setError(
          "We couldn’t create your account right now. Please try again later."
        );
      }

      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    loading,
    error,
  };
}
