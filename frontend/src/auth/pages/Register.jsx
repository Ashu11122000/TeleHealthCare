import React, { useCallback, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";

/**
 * Register Page — Phase 18 (Ultra-Premium, Single Column)
 *
 * Design goals:
 * - Realistic healthcare SaaS look
 * - Calm, secure, non-white UI
 * - Single focused column (no left/right split)
 */
export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const roleHint = searchParams.get("role") || "patient";

  const handleRegisterSuccess = useCallback(
    ({ role }) => {
      navigate("/verify-otp", {
        replace: true,
        state: { role },
      });
    },
    [navigate]
  );

  const headerCopy = useMemo(() => {
    if (roleHint === "doctor") {
      return {
        title: "Create your professional account",
        subtitle:
          "Secure onboarding for healthcare professionals. Profiles remain private until approval.",
      };
    }

    return {
      title: "Create your account",
      subtitle:
        "Secure access to your healthcare services. You stay fully in control of your data.",
      };
  }, [roleHint]);

  const trustPoints = useMemo(
    () => [
      {
        id: "encryption",
        text: "End-to-end encrypted account creation",
        color: "text-emerald-600",
      },
      {
        id: "verification",
        text: "Email verification prevents unauthorized access",
        color: "text-blue-600",
      },
      {
        id: "privacy",
        text: "No medical data collected at this stage",
        color: "text-indigo-600",
      },
    ],
    []
  );

  return (
    <main
      className="
        min-h-screen flex items-center justify-center px-4
        bg-gradient-to-br from-indigo-50 via-sky-50 to-teal-50
        relative overflow-hidden
      "
      aria-labelledby="register-heading"
    >
      {/* Subtle background glow */}
      <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-blue-300/25 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-indigo-300/25 blur-3xl" />

      {/* Card wrapper with gradient border */}
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
          <header className="mb-8 text-center">
            <h1
              id="register-heading"
              className="text-2xl font-semibold text-slate-900 tracking-tight"
            >
              {headerCopy.title}
            </h1>

            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              {headerCopy.subtitle}
            </p>
          </header>

          {/* ---------- Registration Form ---------- */}
          <RegisterForm
            roleHint={roleHint}
            onSuccess={handleRegisterSuccess}
          />

          {/* ---------- Trust Indicators ---------- */}
          <div
            className="
              mt-8 flex flex-wrap justify-center gap-2
            "
            aria-label="Security and privacy assurances"
          >
            {trustPoints.map((item) => (
              <div
                key={item.id}
                className="
                  inline-flex items-center gap-2
                  rounded-full
                  bg-slate-100/80
                  border border-slate-200
                  px-3 py-1.5
                  text-xs text-slate-700
                "
              >
                <span className={`${item.color}`}>●</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          {/* ---------- Footer ---------- */}
          <footer className="mt-8 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="
                font-medium text-indigo-600
                hover:text-indigo-700 hover:underline
                focus:outline-none
                focus-visible:ring-2 focus-visible:ring-indigo-500
                focus-visible:ring-offset-2 rounded-sm
              "
            >
              Sign in
            </Link>
          </footer>

          {/* ---------- Security Note ---------- */}
          <div className="mt-6 text-center text-[11px] text-slate-500 leading-relaxed">
            <p>🔒 Email verification is required before access.</p>
            <p className="mt-1">
              This protects your account and personal information.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
