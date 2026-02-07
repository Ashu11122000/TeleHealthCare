import React, { useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import LoginForm from "../components/LoginForm";

/**
 * Login Page — Phase 18 (Ultra-Premium)
 *
 * Design goals:
 * - Calm, trustworthy healthcare experience
 * - Non-white, realistic SaaS look
 * - Clear feedback without alarm
 */
export default function Login() {
  const location = useLocation();

  /**
   * Contextual messages passed from:
   * - VerifyOTP (email verified)
   * - ResetPassword (password reset success)
   */
  const infoMessage = useMemo(() => {
    if (location.state?.verified) {
      return {
        text: "Your email has been verified. You can now sign in.",
        tone: "success",
      };
    }
    if (location.state?.passwordReset) {
      return {
        text: "Your password has been updated successfully. Please sign in.",
        tone: "success",
      };
    }
    return null;
  }, [location.state]);

  /**
   * Clear navigation state after render
   */
  useEffect(() => {
    if (location.state) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <main
      className="
        min-h-screen flex items-center justify-center px-4
        bg-gradient-to-br from-indigo-50 via-sky-50 to-teal-50
        relative overflow-hidden
      "
      aria-labelledby="login-heading"
    >
      {/* Subtle ambient glow */}
      <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-blue-300/25 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-indigo-300/25 blur-3xl" />

      {/* Card wrapper with gradient edge */}
      <section
        className="
          relative z-10 w-full max-w-md
          rounded-3xl p-[1px]
          bg-gradient-to-br from-indigo-200 via-blue-200 to-teal-200
          shadow-[0_30px_90px_rgba(30,64,175,0.25)]
        "
      >
        <div
          className="
            rounded-3xl
            bg-white/90 backdrop-blur
            border border-white/60
            p-6 sm:p-8
          "
        >
          {/* ---------- Header ---------- */}
          <header className="mb-6 text-center">
            <h1
              id="login-heading"
              className="text-2xl font-semibold text-slate-900 tracking-tight"
            >
              Sign in to your account
            </h1>

            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Secure access to your healthcare services.
            </p>
          </header>

          {/* ---------- Contextual Info ---------- */}
          {infoMessage && (
            <div
              className="
                mb-5 rounded-xl
                border border-emerald-200
                bg-emerald-50/80
                px-4 py-3
                text-sm text-emerald-700
              "
              role="status"
            >
              {infoMessage.text}
            </div>
          )}

          {/* ---------- Login Form ---------- */}
          <LoginForm />

          {/* ---------- Footer Navigation ---------- */}
          <div className="mt-6 flex items-center justify-between text-sm">
            <Link
              to="/forgot-password"
              className="
                text-indigo-600 font-medium
                hover:text-indigo-700 hover:underline
                focus:outline-none
                focus-visible:ring-2 focus-visible:ring-indigo-500
                focus-visible:ring-offset-2 rounded-sm
              "
            >
              Forgot password?
            </Link>

            <Link
              to="/register"
              className="
                text-indigo-600 font-medium
                hover:text-indigo-700 hover:underline
                focus:outline-none
                focus-visible:ring-2 focus-visible:ring-indigo-500
                focus-visible:ring-offset-2 rounded-sm
              "
            >
              Create account
            </Link>
          </div>

          {/* ---------- Security Note ---------- */}
          <div className="mt-6 text-center text-[11px] text-slate-500 leading-relaxed">
            🔒 Your session is protected using industry-standard security practices.
          </div>
        </div>
      </section>
    </main>
  );
}
