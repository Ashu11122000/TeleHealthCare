import React from "react";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPasswordApi } from "../auth.api";

/**
 * ForgotPassword — Phase 18
 *
 * Responsibilities:
 * - Initiate password reset securely
 * - Never reveal account existence
 * - Provide calm, non-alarming UX
 * - Guide user to next step clearly
 */
export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [error, setError] = useState(null);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!email) return;

      setStatus("submitting");
      setError(null);

      try {
        await forgotPasswordApi({ email: email.trim() });

        // IMPORTANT:
        // Always show success (anti-enumeration security)
        setStatus("success");
      } catch (err) {
        // Backend errors should be rare — still handled calmly
        setStatus("error");
        setError(
          err?.response?.data?.message ||
            "We couldn’t process your request right now. Please try again later."
        );
      }
    },
    [email]
  );

  return (
    <main
      className="min-h-screen flex items-center justify-center
                 bg-gradient-to-b from-slate-50 to-slate-100 px-4"
      aria-labelledby="forgot-heading"
    >
      <section
        className="w-full max-w-md
                   bg-white/95 backdrop-blur
                   rounded-2xl border border-slate-200
                   shadow-[0_20px_60px_rgba(0,0,0,0.08)]
                   p-6 sm:p-8"
      >
        {/* ---------- Header ---------- */}
        <header className="mb-6">
          <h1
            id="forgot-heading"
            className="text-xl font-semibold text-slate-900 tracking-tight"
          >
            Reset your password
          </h1>

          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Enter the email address associated with your account.
            We’ll send you instructions to reset your password.
          </p>
        </header>

        {/* ---------- Success State ---------- */}
        {status === "success" ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <p className="font-medium">
              If an account exists for this email, we’ve sent reset instructions.
            </p>
            <p className="mt-1 text-green-600">
              Please check your inbox and spam folder.
            </p>

            <button
              onClick={() => navigate("/login", { replace: true })}
              className="mt-4 text-sm text-blue-600 underline"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          /* ---------- Form ---------- */
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Error */}
            {status === "error" && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white
                         hover:bg-blue-700
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "submitting"
                ? "Sending instructions…"
                : "Send reset instructions"}
            </button>
          </form>
        )}

        {/* ---------- Footer Security Note ---------- */}
        <div className="mt-6 text-center text-[11px] text-slate-500 leading-relaxed">
          🔒 For your security, we don’t confirm whether an email is registered.
        </div>
      </section>
    </main>
  );
}
