import React from "react";
import { useEffect, useRef } from "react";
import { Clock, ShieldCheck } from "lucide-react";

/**
 * SessionExpiryModal
 *
 * Responsibilities:
 * - Warn user before forced logout
 * - Offer clear, calm choice
 * - Never surprise logout
 * - Trap focus for accessibility
 *
 * Props:
 * - open: boolean
 * - onStay(): refresh session
 * - onLogout(): logout user
 * - secondsLeft?: number (optional, future-ready)
 */
export default function SessionExpiryModal({
  open,
  onStay,
  onLogout,
  secondsLeft,
}) {
  const stayButtonRef = useRef(null);

  // Autofocus primary action
  useEffect(() => {
    if (open) {
      stayButtonRef.current?.focus();
    }
  }, [open]);

  // Escape key support
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        onLogout();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () =>
      window.removeEventListener("keydown", onKeyDown);
  }, [open, onLogout]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-expiry-title"
      aria-describedby="session-expiry-desc"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl
                   border border-gray-100 animate-in fade-in zoom-in"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>

          <div>
            <h2
              id="session-expiry-title"
              className="text-lg font-semibold text-gray-900"
            >
              Session expiring soon
            </h2>
            <p className="text-sm text-gray-500">
              For your security
            </p>
          </div>
        </div>

        {/* Body */}
        <p
          id="session-expiry-desc"
          className="mt-4 text-sm text-gray-600"
        >
          Your secure session will expire shortly due to inactivity.
          You can stay signed in or log out now.
        </p>

        {/* Optional countdown */}
        {typeof secondsLeft === "number" && (
          <p className="mt-2 text-xs text-gray-500">
            Time remaining:{" "}
            <span className="font-medium">
              {secondsLeft}s
            </span>
          </p>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onLogout}
            className="rounded-lg px-4 py-2 text-sm text-gray-600
                       hover:text-gray-800 focus:outline-none
                       focus:ring-2 focus:ring-gray-300"
          >
            Log out
          </button>

          <button
            ref={stayButtonRef}
            onClick={onStay}
            className="inline-flex items-center gap-2 rounded-lg
                       bg-blue-600 px-4 py-2 text-sm font-medium text-white
                       hover:bg-blue-700 focus:outline-none
                       focus:ring-2 focus:ring-blue-500"
          >
            <ShieldCheck className="h-4 w-4" />
            Stay signed in
          </button>
        </div>

        {/* Footer reassurance */}
        <p className="mt-4 text-center text-xs text-gray-500">
          Your data remains protected at all times.
        </p>
      </div>
    </div>
  );
}
