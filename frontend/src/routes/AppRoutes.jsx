import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import AuthLayout from './../layouts/AuthLayout';
import PatientLayout from "../layouts/PatientLayout";
import DoctorLayout from "../layouts/DoctorLayout";
import AdminLayout from "../layouts/AdminLayout";

// Gaurds
import ProtectedRoute from './ProtectedRoute';
import FeatureRoleGuard from "./FeatureRoleGuard";

// Auth Pages
import Login from './../auth/pages/Login';
import Register from './../auth/pages/Register';
import VerifyOTP from "./../auth/pages/VerifyOTP";
import ForgotPassword from './../auth/pages/ForgotPassword';
import ResetPassword from './../auth/pages/ResetPassword';

// Patient Pages
import PatientDashboard from "./../patient/pages/Dashboard";
import SymptomCheck from "./../patient/pages/SymptomCheck";
import Appointments from "./../patient/pages/Appointments";
import Doctors from "./../patient/pages/Doctors";
import Profile from "./../patient/pages/Profile";

// Doctor Pages
import DoctorDashboard from "./../doctor/pages/Dashboard";
import DoctorAppointments from "./../doctor/pages/Appointents";
import Availability from "./../doctor/pages/Patients";
import Patients from "./../doctor/pages/Patients";
import DoctorProfile from "./../doctor/pages/Profile";

// Admin Pages
import AdminDashboard from "./../admin/pages/Dashboard";
import UserManagement from "./../admin/pages/UserManagement";
import DoctorVerification from "./../admin/pages/DoctorVerification";
import AuditLogs from "./../admin/pages/AuditLogs";
import Reports from "./../admin/pages/Reports";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= PUBLIC / AUTH ROUTES ================= */}
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* ================= PATIENT ROUTES ================= */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleGuard allowedRoles={["patient"]} />}>
            <Route element={<PatientLayout />}>
              <Route path="/patient/dashboard" element={<PatientDashboard />} />
              <Route path="/patient/symptoms" element={<SymptomCheck />} />
              <Route path="/patient/appointments" element={<Appointments />} />
              <Route path="/patient/doctors" element={<Doctors />} />
              <Route path="/patient/profile" element={<Profile />} />
            </Route>
          </Route>
        </Route>

        {/* ================= DOCTOR ROUTES ================= */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleGuard allowedRoles={["doctor"]} />}>
            <Route element={<DoctorLayout />}>
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor/appointments" element={<DoctorAppointments />} />
              <Route path="/doctor/availability" element={<Availability />} />
              <Route path="/doctor/patients" element={<Patients />} />
              <Route path="/doctor/profile" element={<DoctorProfile />} />
            </Route>
          </Route>
        </Route>

        {/* ================= ADMIN ROUTES ================= */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleGuard allowedRoles={["admin"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/doctors" element={<DoctorVerification />} />
              <Route path="/admin/audit-logs" element={<AuditLogs />} />
              <Route path="/admin/reports" element={<Reports />} />
            </Route>
          </Route>
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}