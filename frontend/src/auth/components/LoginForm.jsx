import React from "react";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { useLogin } from "../hooks/useLogin";
import AccountLockBanner from "./AccoutLockBanner";

export default function LoginForm() {
  const login = useLogin();

  const { status, error, securityInfo } = useSelector(
    (state) => state.auth
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isLoading = status === "loading";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;

    login({ email, password });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-[380px] rounded-xl bg-white p-8 shadow-lg border border-gray-100 space-y-5"
      aria-label="Login form"
    >
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-gray-900">
          Sign in to your account
        </h1>
        <p className="text-sm text-gray-500">
          Secure access to your healthcare dashboard
        </p>
      </div>

      {/* Security banner (account lock / attempts) */}
      <AccountLockBanner info={securityInfo} />

      {/* Email */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Email address
        </label>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="you@example.com"
        />
      </div>

      {/* Password */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Password
        </label>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="••••••••"
          />

          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2
                       text-gray-500 hover:text-gray-700"
            aria-label={
              showPassword ? "Hide password" : "Show password"
            }
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error?.message && (
        <p
          role="alert"
          className="text-sm text-red-600"
        >
          {error.message}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2
                   rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white
                   hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed
                   transition"
      >
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        {isLoading ? "Signing in…" : "Sign In"}
      </button>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500">
        Protected by secure authentication and session monitoring
      </div>
    </form>
  );
}
