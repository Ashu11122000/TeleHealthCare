import React from "react";
import { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  ShieldCheck,
  ShieldAlert,
  LogOut,
  X,
} from "lucide-react";
import { clearLogoutReason } from "../../state/auth.slice";

/**
 * SecurityEventBanner
 *
 * Purpose:
 * - Communicate logout & security events clearly
 * - Reassure users their data is safe
 * - Never sound alarming or technical
 */

const EVENT_CONFIG = {
  SESSION_EXPIRED: {
    title: "Session expired",
    message:
      "For your security, your session has expired. Please sign in again to continue.",
    tone: "warning",
    icon: ShieldAlert,
  },
  SECURITY_EVENT: {
    title: "Security check completed",
    message:
      "Your session was ended as part of a security check. No action is required from you.",
    tone: "warning",
    icon: ShieldAlert,
  },
  LOGOUT_MANUAL: {
    title: "Signed out successfully",
    message:
      "You have been signed out. Thank you for keeping your account secure.",
    tone: "info",
    icon: LogOut,
  },
};

const TONE_STYLES = {
  info: {
    container:
      "bg-blue-50 border-blue-200 text-blue-800",
  },
  warning: {
    container:
      "bg-yellow-50 border-yellow-300 text-yellow-900",
  },
  danger: {
    container:
      "bg-red-50 border-red-300 text-red-900",
  },
};

export default function SecurityEventBanner() {
  const dispatch = useDispatch();
  const { logoutReason } = useSelector(
    (state) => state.auth
  );

  const [dismissed, setDismissed] =
    useState(false);

  const event = useMemo(() => {
    return EVENT_CONFIG[logoutReason] || null;
  }, [logoutReason]);

  if (!logoutReason || !event || dismissed)
    return null;

  const Icon = event.icon;
  const styles =
    TONE_STYLES[event.tone] ||
    TONE_STYLES.info;

  const handleDismiss = () => {
    setDismissed(true);
    dispatch(clearLogoutReason());
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start justify-between gap-3
                  rounded-lg border px-4 py-3 text-sm shadow-sm
                  ${styles.container}`}
    >
      {/* Left content */}
      <div className="flex gap-3">
        <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />

        <div className="space-y-0.5">
          <p className="font-medium leading-tight">
            {event.title}
          </p>
          <p className="opacity-90">
            {event.message}
          </p>
        </div>
      </div>

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss security message"
        className="rounded-md p-1 text-current opacity-70
                   hover:opacity-100 focus:outline-none
                   focus:ring-2 focus:ring-offset-2"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
