import axios from "axios";
import store from "../state/store";
import { setSession, logout } from "../state/auth.slice";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // for refresh cookie
});

/**
 * Attach access token to every request
 */
api.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.auth.accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Handle 401 globally
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        store.dispatch(setSession(res.data));

        originalRequest.headers.Authorization =
          `Bearer ${res.data.accessToken}`;

        return api(originalRequest);
      } catch {
        store.dispatch(logout("SESSION_EXPIRED"));
        localStorage.setItem("logout", Date.now());
      }
    }

    return Promise.reject(error);
  }
);

export default api;
