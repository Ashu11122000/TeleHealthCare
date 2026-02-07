import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import SessionExpiryModal from "./components/SessionExpiryModal";
import {
  logout,
  setSessionExpiring,
} from "../state/auth.slice";

/**
 * AuthWatcher
 *
 * Responsibilities:
 * - Monitor session expiry safely
 * - Warn user BEFORE logout
 * - Never surprise logout
 * - Stay silent unless needed
 *
 * This component renders NO UI except the modal.
 */
export default function AuthWatcher() {
  const dispatch = useDispatch();

  const {
    expiresAt,
    status,
    sessionStatus,
  } = useSelector((s) => s.auth);

  const [modalOpen, setModalOpen] =
    useState(false);

  const warningTimerRef = useRef(null);
  const hasWarnedRef = useRef(false);

  /**
   * Arm / re-arm session expiry watcher
   */
  useEffect(() => {
    // Reset everything if user is not authenticated
    if (
      !expiresAt ||
      status !== "authenticated"
    ) {
      clearTimers();
      setModalOpen(false);
      hasWarnedRef.current = false;
      return;
    }

    const now = Date.now();
    const warningOffset = 60_000; // 60s before expiry
    const timeUntilWarning =
      expiresAt - now - warningOffset;

    // If already within warning window
    if (timeUntilWarning <= 0) {
      triggerWarning();
      return;
    }

    // Arm warning timer
    warningTimerRef.current = setTimeout(
      triggerWarning,
      timeUntilWarning
    );

    return clearTimers;
  }, [expiresAt, status]);

  /**
   * Trigger session expiring state + modal
   */
  function triggerWarning() {
    if (hasWarnedRef.current) return;

    hasWarnedRef.current = true;

    dispatch(setSessionExpiring());
    setModalOpen(true);
  }

  /**
   * Cleanup timers safely
   */
  function clearTimers() {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
  }

  /**
   * User chooses to stay logged in
   * (Actual refresh handled elsewhere)
   */
  const handleStay = () => {
    setModalOpen(false);
    hasWarnedRef.current = false;
  };

  /**
   * User chooses logout
   */
  const handleLogout = () => {
    setModalOpen(false);
    dispatch(logout("SESSION_EXPIRED"));
  };

  return (
    <SessionExpiryModal
      open={
        modalOpen &&
        sessionStatus === "EXPIRING"
      }
      onStay={handleStay}
      onLogout={handleLogout}
    />
  );
}
