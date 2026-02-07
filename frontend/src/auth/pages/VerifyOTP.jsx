import React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OTPInput from "../components/OTPInput";
import { verifyOtpApi, sendOtpApi } from "../auth.api";

/**
 * VerifyOTP — Phase 18 (Authentication UX & Session Safety)
 *
 * Responsibilities:
 * - Verify OTP securely with backend
 * - Handle resend with cooldown
 * - Provide calm, confidence-building feedback
 * - Never assume success
 */
export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();

  // Passed from Register / Forgot flow
  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState("idle"); // idle | verifying | success | error
  const [error, setError] = useState(null);

  const [resendCooldown, setResendCooldown] = useState(0);
  const isVerifying = status === "verifying";
  const isSuccess = status === "success";

  /**
   * Safety guard — no email means invalid entry
   */
  useEffect(() => {
    if (!email) {
      navigate("/login", { replace: true });
    }
  }, [email, navigate]);

  /**
   * Resend OTP cooldown timer
   */
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((c) => c - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const otpComplete = useMemo(() => otp.length === 6, [otp]);

  /**
   * Verify OTP
   */
  const handleVerify = useCallback(async () => {
    if (!otpComplete || isVerifying) return;

    setStatus("verifying");
    setError(null);

    try {
      const res = await verifyOtpApi({ email, otp });

      if (res?.success) {
        setStatus("success");

        setTimeout(() => {
          navigate("/login", {
            replace: true,
            state: { verified: true },
          });
        }, 1200);
      } else {
        throw new Error(res?.message);
      }
    } catch (err) {
      setStatus("error");
      setError(
        err?.response?.data?.message ||
          "The code is invalid or has expired. Please try again."
      );
    }
  }, [otpComplete, isVerifying, email, otp, navigate]);

  /**
   * Resend OTP
   */
  const handleResend = useCallback(async () => {
    if (resendCooldown > 0) return;

    try {
      await sendOtpApi({ email });
      setResendCooldown(60); // 60s cooldown
    } catch {
      // Silent failure (security)
    }
  }, [email, resendCooldown]);

  return (
    <main
      className="min-h-screen flex items-center justify-center
                 bg-gradient-to-b from-slate-50 to-slate-100 px-4"
      aria-labelledby="otp-heading"
    >
      <section
        className="w-full max-w-sm
                   bg-white/95 backdrop-blur
                   rounded-2xl border border-slate-200
                   shadow-[0_20px_60px_rgba(0,0,0,0.08)]
                   p-6 sm:p-8"
      >
        {/* ---------- Header ---------- */}
        <header className="mb-6 text-center">
          <h1
            id="otp-heading"
            className="text-xl font-semibold text-slate-900 tracking-tight"
          >
            Verify your email
          </h1>

          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Enter the 6-digit code sent to
            <br />
            <span className="font-medium text-slate-800">{email}</span>
          </p>
        </header>

        {/* ---------- OTP Input ---------- */}
        <OTPInput
          value={otp}
          onChange={setOtp}
          disabled={isVerifying || isSuccess}
        />

        {/* ---------- Status ---------- */}
        <div className="mt-4 min-h-[44px] text-center text-sm">
          {status === "verifying" && (
            <p className="text-slate-500">
              Verifying your code…
            </p>
          )}

          {status === "success" && (
            <p className="text-green-600 font-medium">
              Email verified successfully
            </p>
          )}

          {status === "error" && (
            <p className="text-red-600">
              {error}
            </p>
          )}
        </div>

        {/* ---------- Verify Button ---------- */}
        <button
          onClick={handleVerify}
          disabled={!otpComplete || isVerifying}
          className="mt-6 w-full rounded-lg
                     bg-blue-600 py-2.5 text-sm font-medium text-white
                     hover:bg-blue-700
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isVerifying ? "Verifying…" : "Verify code"}
        </button>

        {/* ---------- Resend ---------- */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Didn’t receive the code?
          <br />
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="mt-1 text-blue-600 underline
                       disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            {resendCooldown > 0
              ? `Resend available in ${resendCooldown}s`
              : "Resend email"}
          </button>
        </div>

        {/* ---------- Security Note ---------- */}
        <div className="mt-6 text-center text-[11px] text-slate-500">
          🔒 This verification is required to protect your account.
        </div>
      </section>
    </main>
  );
}
