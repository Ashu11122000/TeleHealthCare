import AppProviders from "./AppProviders";
import AppRoutes from "../routes/AppRoutes";

export default function Bootstrap() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}
