import { createContext, useContext } from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { featureFlags } from "../config/featureFlags";

/**
 * Feature Flag Context
 */
const FeatureFlagContext = createContext(featureFlags);

/**
 * Provider (wrap at app level)
 */
export function FeatureFlagProvider({ children }) {
  return (
    <FeatureFlagContext.Provider value={featureFlags}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

/**
 * FeatureRoleGuard
 * Can check:
 * - allowedRoles (RBAC)
 * - flag (feature toggle)
 */
export default function FeatureRoleGuard({
  allowedRoles,
  flag,
}) {
  const { user } = useSelector((state) => state.auth);
  const flags = useContext(FeatureFlagContext);

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role restriction
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  // Feature flag restriction
  if (flag && (!flags || flags[flag] !== true)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
