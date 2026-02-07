import React from "react";
import { useState } from "react";
import { useRegister } from "../hooks/useRegister";
import PasswordStrength from "./PasswordStrength";

export default function RegisterForm({ onSuccess, roleHint = "patient" }) {
  const { register, loading, error } = useRegister();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: roleHint,
    acceptTerms: false,
  });

  const passwordMismatch =
    form.password &&
    form.confirmPassword &&
    form.password !== form.confirmPassword;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordMismatch || !form.acceptTerms) return;

    const result = await register({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
    });

    if (result?.success) onSuccess?.({ role: result.role });
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="
        relative space-y-7 rounded-3xl
        bg-gradient-to-br from-white via-blue-50 to-indigo-50
        border border-blue-100
        shadow-[0_30px_80px_rgba(30,64,175,0.15)]
        p-7 sm:p-9
      "
    >
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">
          Create your account
        </h1>
        <p className="text-sm text-slate-600">
          Secure, HIPAA-aware access to your healthcare services.
        </p>
      </header>

      {/* Identity */}
      <section className="rounded-2xl bg-white/70 backdrop-blur p-5 space-y-4 border border-slate-200">
        <Field
          label="Full name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Your full name"
          required
        />

        <Field
          label="Email address"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
          helper="We’ll only use this for important account updates."
        />

        <SelectField
          label="Account type"
          name="role"
          value={form.role}
          onChange={handleChange}
          options={[
            { value: "patient", label: "Patient" },
            { value: "doctor", label: "Doctor" },
          ]}
        />
      </section>

      {/* Security */}
      <section className="rounded-2xl bg-white/70 backdrop-blur p-5 space-y-4 border border-slate-200">
        <Field
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Minimum 8 characters"
          required
        />

        <PasswordStrength password={form.password} />

        <Field
          label="Confirm password"
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Re-enter password"
          required
          error={passwordMismatch && "Passwords do not match"}
        />
      </section>

      {/* Terms */}
      <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-100 p-4">
        <input
          type="checkbox"
          name="acceptTerms"
          checked={form.acceptTerms}
          onChange={handleChange}
          className="mt-1 accent-indigo-600"
        />
        <p className="text-sm text-slate-700">
          I agree to the{" "}
          <span className="font-medium text-indigo-600 underline cursor-pointer">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="font-medium text-indigo-600 underline cursor-pointer">
            Privacy Policy
          </span>
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || passwordMismatch || !form.acceptTerms}
        className="
          w-full rounded-xl py-3 text-sm font-semibold text-white
          bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500
          hover:brightness-110
          shadow-lg shadow-blue-500/30
          focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        {loading ? "Creating your account…" : "Create account"}
      </button>

      {/* Footer */}
      <p className="text-center text-xs text-slate-500">
        🔒 Your data is encrypted and protected at all times.
      </p>
    </form>
  );
}

/* =========================
   Reusable Fields
========================= */

function Field({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required,
  error,
  helper,
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">
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
        className={`
          w-full rounded-lg px-3 py-2.5 text-sm
          bg-white border
          ${error
            ? "border-red-300 focus:ring-red-500"
            : "border-slate-300 focus:ring-indigo-500"}
          focus:outline-none focus:ring-2
        `}
      />

      {helper && !error && (
        <p className="text-xs text-slate-500">{helper}</p>
      )}

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="
          w-full rounded-lg px-3 py-2.5 text-sm
          bg-white border border-slate-300
          focus:outline-none focus:ring-2 focus:ring-indigo-500
        "
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
