import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const auth = useSelector((s) => s.auth);
  return auth.isAuthenticated ? children : <Navigate to="/login" />;
}
