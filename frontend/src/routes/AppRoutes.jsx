import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";

import Login from "../auth/pages/Login";
import Register from "../auth/pages/Register";
import VerifyOTP from "../auth/pages/VerifyOTP";
import ForgotPassword from "../auth/pages/ForgotPassword";
import ResetPassword from "../auth/pages/ResetPassword";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
