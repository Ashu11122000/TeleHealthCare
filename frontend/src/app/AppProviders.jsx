import React from "react";
import { Provider } from "react-redux";
import { store } from "../state/store";

export default function AppProviders({ children }) {
  return <Provider store={store}>{children}</Provider>;
}
