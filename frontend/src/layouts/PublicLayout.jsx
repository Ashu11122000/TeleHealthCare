import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="p-4 shadow bg-white">
        <h1 className="text-xl font-semibold text-blue-600">
          TeleHealth Platform
        </h1>
      </header>

      <main className="p-6">
        <Outlet />
      </main>

      <footer className="p-4 text-center text-sm text-gray-500">
        © 2026 TeleHealth. All rights reserved.
      </footer>
    </div>
  );
}
