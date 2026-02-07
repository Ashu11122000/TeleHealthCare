import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../../utils/api";
import {
  setSession,
  expireSession,
  logout,
  setSessionExpiring,
} from "../../state/auth.slice";

/**
 * Healthcare-grade session lifecycle manager
 *
 * Session States:
 * ACTIVE → EXPIRING → EXPIRED → LOGGED_OUT
 */
export default function useRefreshToken() {
  const dispatch = useDispatch();

  const { expiresAt, refreshToken, status } = useSelector(
    (state) => state.auth
  );

  const refreshTimeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    if (!expiresAt || !refreshToken || status !== "authenticated") {
      return;
    }

    // Cleanup old timers
    clearTimeout(refreshTimeoutRef.current);
    clearTimeout(warningTimeoutRef.current);

    const now = Date.now();
    const timeRemaining = expiresAt - now;

    if (timeRemaining <= 0) {
      handleSessionExpiry();
      return;
    }

    /**
     * 1️⃣ SESSION EXPIRING WARNING (UX VISIBLE)
     * 60 seconds before expiry
     */
    if (timeRemaining > 60_000) {
      warningTimeoutRef.current = setTimeout(() => {
        dispatch(setSessionExpiring());
        // UI Layer will show:
        // "Your session is about to expire. Stay logged in?"
      }, timeRemaining - 60_000);
    }

    /**
     * 2️⃣ SILENT TOKEN REFRESH
     * 30 seconds before expiry
     */
    if (timeRemaining > 30_000) {
      refreshTimeoutRef.current = setTimeout(async () => {
        if (isRefreshingRef.current) return;

        isRefreshingRef.current = true;

        try {
          const res = await api.post("/auth/refresh");

          dispatch(setSession(res.data));
        } catch (error) {
          handleSessionExpiry();
        } finally {
          isRefreshingRef.current = false;
        }
      }, timeRemaining - 30_000);
    }

    /**
     * 3️⃣ MULTI-TAB LOGOUT SYNC
     */
    const onStorageLogout = (event) => {
      if (event.key === "logout") {
        dispatch(logout("SESSION_TERMINATED_OTHER_TAB"));
      }
    };

    window.addEventListener("storage", onStorageLogout);

    return () => {
      clearTimeout(refreshTimeoutRef.current);
      clearTimeout(warningTimeoutRef.current);
      window.removeEventListener("storage", onStorageLogout);
    };
  }, [expiresAt, refreshToken, status, dispatch]);

  /**
   * Centralised session expiry handler
   * Ensures calm, predictable logout
   */
  function handleSessionExpiry() {
    dispatch(expireSession());
    dispatch(logout("SESSION_EXPIRED"));

    // Sync logout across all tabs
    localStorage.setItem("logout", Date.now());
  }
}
