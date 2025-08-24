import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { jwtDecode } from "jwt-decode";

export function AuthGuard() {
    // const { user } = useAuth();
    const token = localStorage.getItem("token");
    let user = null;
    if (token) {
        try {
            user = jwtDecode(token);
        } catch (_) {
            user = null;
        }
    }

    return user ? <Outlet /> : <Navigate to="/login" replace />;
}
export function SuperAdminGuard() {
    // const { isSuperAdmin } = useAuth();
    const token = localStorage.getItem("token");
    let user = null;
    if (token) {
        try {
            user = jwtDecode(token);
        } catch (_) {
            user = null;
        }
    }

    let isSuperAdmin = user?.role === "superadmin";
    return isSuperAdmin ? <Outlet /> : <Navigate to="/403" replace />;
}
