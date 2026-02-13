import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

/**
 * ProtectedRoute
 * Checks if user is authenticated
 * Used as a wrapper in AppRoutes.jsx
 */
export default function ProtectedRoute() {
  const isAuthenticated = useSelector(
    (state) => state.auth.isAuthenticated
  );

  // Not logged in → go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Logged in → allow nested routes
  return <Outlet />;
}
