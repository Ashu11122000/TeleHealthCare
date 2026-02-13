import { createContext, useContext } from "react";
import { featureFlags } from "../config/featureFlags";

/**
 * Feature Flag Context
 * Holds system-wide feature toggles
 */
const FeatureFlagContext = createContext(featureFlags);

/**
 * Provider used at app bootstrap level
 */
export function FeatureFlagProvider({ children }) {
  return (
    <FeatureFlagContext.Provider value={featureFlags}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

/**
 * Guard to conditionally render UI based on feature flag
 *
 * Usage:
 * <FeatureFlagGuard flag="AI_ANALYSIS">
 *   <Component />
 * </FeatureFlagGuard>
 */
export function FeatureFlagGuard({ flag, children }) {
  const flags = useContext(FeatureFlagContext);

  // Safety: if flags not loaded or flag missing → hide UI
  if (!flags || !flags[flag]) {
    return null;
  }

  return children;
}
