import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthGuard, SuperAdminGuard } from "./components/common/Guards";

import AdminLayout from "./components/Layout/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Companies from "./pages/Companies";
import Billing from "./pages/Billing";
import Logs from "./pages/Logs";
import Support from "./pages/Support";
import Settings from "./pages/Settings";
import ModulesCMS from "./pages/ModulesCMS";
import Discounts from './pages/Discounts';
import PlanManager from "./pages/PlanCard";

import Login from "./pages/Login";
import NotFound404 from "./pages/404";


const Dummy = ({ text }) => <div style={{ padding: 24 }}>{text}</div>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/403" element={<Dummy text="403 — Forbidden" />} />


          <Route element={<AuthGuard />}>
            <Route element={<SuperAdminGuard />}>
              <Route element={<AdminLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/users" element={<Users />} />
                <Route path="/companies" element={<Companies />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/logs" element={<Logs />} />
                <Route path="/support" element={<Support />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/discounts" element={<Discounts />} />
                <Route path="/modules" element={<ModulesCMS />} />
                <Route path="/plancards" element={<PlanManager />} />

              </Route>
            </Route>
          </Route>

          <Route path="/*" element={<NotFound404 />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
