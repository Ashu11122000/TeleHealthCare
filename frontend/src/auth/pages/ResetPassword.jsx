import React, { useCallback, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PasswordStrength from "../components/PasswordStrength";
import { resetPasswordApi } from "../auth.api";

/**
 * ResetPassword — Phase 18 (Ultra-Premium UX)
 *
 * Design goals:
 * - Calm, secure, non-alarming
 * - Realistic healthcare SaaS look
 * - Zero white-flat UI
 */
export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const token = params.get("token");
  const tokenMissing = useMemo(() => !token, [token]);

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const passwordMismatch =
    form.password &&
    form.confirmPassword &&
    form.password !== form.confirmPassword;

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (tokenMissing || passwordMismatch || !form.password) return;

      setStatus("submitting");
      setError(null);

      try {
        const response = await resetPasswordApi({
          token,
          password: form.password,
        });

        if (!response?.success) {
          throw new Error(response?.message);
        }

        setStatus("success");

        setTimeout(() => {
          navigate("/login", {
            replace: true,
            state: { passwordReset: true },
          });
        }, 1800);
      } catch (err) {
        setStatus("error");
        setError(
          err?.response?.data?.message ||
            "This reset link is invalid or has expired. Please request a new one."
        );
      }
    },
    [token, tokenMissing, form.password, passwordMismatch, navigate]
  );

  /* ---------------- INVALID TOKEN ---------------- */
  if (tokenMissing) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4
                       bg-gradient-to-br from-indigo-50 via-sky-50 to-teal-50">
        <div className="max-w-sm w-full rounded-2xl
                        bg-white/90 backdrop-blur
                        border border-slate-200
                        shadow-[0_20px_60px_rgba(0,0,0,0.12)]
                        p-6 text-center">
          <h1 className="text-lg font-semibold text-slate-900">
            Invalid reset link
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            This password reset link is missing or no longer valid.
          </p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="mt-4 text-sm font-medium text-indigo-600 hover:underline"
          >
            Request a new link
          </button>
        </div>
      </main>
    );
  }

  /* ---------------- MAIN UI ---------------- */
  return (
    <main
      className="
        min-h-screen flex items-center justify-center px-4
        bg-gradient-to-br from-indigo-50 via-sky-50 to-teal-50
        relative overflow-hidden
      "
      aria-labelledby="reset-password-title"
    >
      {/* Ambient glow */}
      <div className="absolute -top-32 -left-32 h-80 w-80 bg-blue-300/25 blur-3xl rounded-full" />
      <div className="absolute -bottom-32 -right-32 h-80 w-80 bg-indigo-300/25 blur-3xl rounded-full" />

      {/* Gradient edge */}
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
          {/* Header */}
          <header className="mb-6 text-center">
            <h1
              id="reset-password-title"
              className="text-xl font-semibold text-slate-900"
            >
              Set a new password
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Choose a strong password to keep your account secure.
            </p>
          </header>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Field
              label="New password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              required
            />

            <PasswordStrength password={form.password} />

            <Field
              label="Confirm new password"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              required
              error={passwordMismatch && "Passwords do not match"}
            />

            {/* Error */}
            {status === "error" && (
              <div className="rounded-xl border border-rose-200
                              bg-rose-50/80 px-4 py-3
                              text-sm text-rose-700">
                {error}
              </div>
            )}

            {/* Success */}
            {status === "success" && (
              <div className="rounded-xl border border-emerald-200
                              bg-emerald-50/80 px-4 py-3
                              text-sm text-emerald-700">
                Password updated successfully. Redirecting…
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={status === "submitting" || passwordMismatch}
              className="
                w-full rounded-xl
                bg-indigo-600 py-2.5
                text-sm font-medium text-white
                hover:bg-indigo-700
                focus:outline-none focus:ring-2 focus:ring-indigo-500
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {status === "submitting"
                ? "Updating password…"
                : "Reset password"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-[11px] text-slate-500">
            🔒 This action is protected and logged for your security.
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---------------- FIELD ---------------- */
function Field({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  required,
  error,
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        aria-invalid={!!error}
        className={`w-full rounded-lg border px-3 py-2 text-sm
          focus:outline-none focus:ring-2
          ${
            error
              ? "border-rose-300 focus:ring-rose-500"
              : "border-slate-300 focus:ring-indigo-500"
          }`}
      />
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
