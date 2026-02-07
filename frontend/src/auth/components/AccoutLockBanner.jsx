import React from "react";
import { useMemo } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Lock,
} from "lucide-react";

/**
 * Security-visible banner for authentication events
 *
 * info = {
 *   locked: boolean,
 *   remainingAttempts?: number,
 *   unlockAt?: number (timestamp, optional)
 * }
 */
export default function AccountLockBanner({ info }) {
  if (!info) return null;

  const {
    title,
    message,
    icon: Icon,
    containerClass,
  } = useMemo(() => {
    // 🔒 Account fully locked
    if (info.locked) {
      return {
        title: "Account temporarily locked",
        message:
          "For your safety, access to this account has been temporarily restricted. Please try again later or reset your password.",
        icon: Lock,
        containerClass:
          "bg-red-50 border-red-300 text-red-800",
      };
    }

    // ⚠️ Last attempt remaining
    if (info.remainingAttempts === 1) {
      return {
        title: "Final login attempt remaining",
        message:
          "One more unsuccessful attempt will temporarily lock your account for security reasons.",
        icon: ShieldAlert,
        containerClass:
          "bg-yellow-50 border-yellow-300 text-yellow-800",
      };
    }

    // ⚠️ General warning
    return {
      title: "Login attempt unsuccessful",
      message: `Please check your credentials. ${info.remainingAttempts} login attempts remaining.`,
      icon: AlertTriangle,
      containerClass:
        "bg-blue-50 border-blue-300 text-blue-800",
    };
  }, [info]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex gap-3 items-start border rounded-lg p-4 text-sm ${containerClass}`}
    >
      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />

      <div className="space-y-1">
        <p className="font-medium leading-tight">
          {title}
        </p>
        <p className="text-sm opacity-90">
          {message}
        </p>

        {/* Future-ready: unlock countdown */}
        {info.unlockAt && (
          <p className="text-xs opacity-70">
            You can try again after{" "}
            {new Date(info.unlockAt).toLocaleTimeString()}.
          </p>
        )}
      </div>
    </div>
  );
}
