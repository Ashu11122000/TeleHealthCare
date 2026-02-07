import { createContext, useContext } from "react";
import { featureFlags } from "../config/featureFlags";

const FeatureFlagContext = createContext(featureFlags);

export function FeatureFlagProvider({ children }) {
  return (
    <FeatureFlagContext.Provider value={featureFlags}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function FeatureFlagGuard({ flag, children }) {
  const flags = useContext(FeatureFlagContext);
  return flags[flag] ? children : null;
}
