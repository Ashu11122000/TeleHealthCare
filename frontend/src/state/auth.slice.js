import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  /* Auth identity */
  user: null,
  accessToken: null,
  refreshToken: null,
  expiresAt: null,

  /* Status */
  status: "idle", // idle | loading | authenticated | error
  isAuthenticated: false,

  /* UX & security */
  error: null,
  logoutReason: null,
  sessionStatus: "ACTIVE", // ACTIVE | EXPIRING | EXPIRED

  /* Security info (account lock, attempts) */
  securityInfo: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /* ---------- LOGIN FLOW ---------- */

    loginStart(state) {
      state.status = "loading";
      state.error = null;
      state.securityInfo = null;
    },

    loginSuccess(state, action) {
      const {
        user,
        accessToken,
        refreshToken,
        expiresAt,
      } = action.payload;

      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.expiresAt = expiresAt;

      state.status = "authenticated";
      state.isAuthenticated = true;
      state.error = null;
      state.sessionStatus = "ACTIVE";
    },

    loginFailure(state, action) {
      state.status = "error";
      state.error = action.payload;

      // Optional: attach security metadata
      if (action.payload?.code === "ACCOUNT_LOCKED") {
        state.securityInfo = {
          locked: true,
        };
      }
    },

    /* ---------- SESSION LIFECYCLE ---------- */

    setSession(state, action) {
      const {
        accessToken,
        refreshToken,
        expiresAt,
      } = action.payload;

      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.expiresAt = expiresAt;

      state.sessionStatus = "ACTIVE";
      state.status = "authenticated";
    },

    setSessionExpiring(state) {
      state.sessionStatus = "EXPIRING";
    },

    expireSession(state) {
      state.sessionStatus = "EXPIRED";
    },

    /* ---------- LOGOUT & SECURITY ---------- */

    logout(state, action) {
      Object.assign(state, initialState);
      state.logoutReason =
        action?.payload || "LOGOUT_MANUAL";

      localStorage.clear();
    },

    clearLogoutReason(state) {
      state.logoutReason = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  setSession,
  setSessionExpiring,
  expireSession,
  logout,
  clearLogoutReason,
} = authSlice.actions;

export default authSlice.reducer;
