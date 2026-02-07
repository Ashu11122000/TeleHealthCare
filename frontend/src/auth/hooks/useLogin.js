import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { loginApi } from "../auth.api";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
} from "../../state/auth.slice";

/**
 * Secure login hook
 * Handles:
 * - Authentication
 * - Token validation
 * - Session bootstrapping
 * - Security-safe failures
 */
export function useLogin() {
  const dispatch = useDispatch();

  /**
   * Login execution
   * @param {Object} credentials
   * @param {string} credentials.email
   * @param {string} credentials.password
   */
  const login = async (credentials) => {
    dispatch(loginStart());

    try {
      const res = await loginApi(credentials);

      /**
       * Expected backend response:
       * {
       *   accessToken,
       *   refreshToken,
       *   requiresOtp?: boolean,
       *   accountLocked?: boolean
       * }
       */

      // 🛑 Account locked (security-visible)
      if (res.data?.accountLocked) {
        dispatch(
          loginFailure({
            code: "ACCOUNT_LOCKED",
            message:
              "Your account is temporarily locked due to multiple failed attempts.",
          })
        );
        return;
      }

      // 🔐 OTP required (step-up authentication)
      if (res.data?.requiresOtp) {
        dispatch(
          loginFailure({
            code: "OTP_REQUIRED",
            message: "Please verify the OTP sent to your email.",
          })
        );
        return;
      }

      const { accessToken, refreshToken } = res.data;

      if (!accessToken || !refreshToken) {
        throw new Error("INVALID_AUTH_RESPONSE");
      }

      // Decode & validate JWT
      const decoded = jwtDecode(accessToken);

      if (!decoded?.exp || !decoded?.sub) {
        throw new Error("INVALID_TOKEN_STRUCTURE");
      }

      const expiresAt = decoded.exp * 1000;

      if (expiresAt <= Date.now()) {
        throw new Error("TOKEN_ALREADY_EXPIRED");
      }

      /**
       * Successful authentication
       */
      dispatch(
        loginSuccess({
          user: {
            id: decoded.sub,
            role: decoded.role,
            email: decoded.email,
          },
          accessToken,
          refreshToken,
          expiresAt,
        })
      );

      /**
       * Multi-tab session sync
       * Clears any stale logout signals
       */
      localStorage.removeItem("logout");
    } catch (error) {
      handleLoginError(error);
    }
  };

  /**
   * Centralised login error handler
   * Converts technical errors → UX-safe messages
   */
  function handleLoginError(error) {
    const code =
      error?.response?.data?.code ||
      error?.message ||
      "LOGIN_FAILED";

    switch (code) {
      case "INVALID_CREDENTIALS":
        dispatch(
          loginFailure({
            code,
            message: "Invalid email or password.",
          })
        );
        break;

      case "ACCOUNT_LOCKED":
        dispatch(
          loginFailure({
            code,
            message:
              "Your account is locked. Please try again later or reset your password.",
          })
        );
        break;

      case "OTP_REQUIRED":
        dispatch(
          loginFailure({
            code,
            message: "OTP verification is required to continue.",
          })
        );
        break;

      case "NETWORK_ERROR":
        dispatch(
          loginFailure({
            code,
            message:
              "Unable to reach the server. Please check your internet connection.",
          })
        );
        break;

      case "TOKEN_ALREADY_EXPIRED":
      case "INVALID_TOKEN_STRUCTURE":
        dispatch(logout("SECURITY_TOKEN_ERROR"));
        break;

      default:
        dispatch(
          loginFailure({
            code: "LOGIN_FAILED",
            message:
              "Login failed. Please try again or contact support if the problem persists.",
          })
        );
    }
  }

  return login;
}
