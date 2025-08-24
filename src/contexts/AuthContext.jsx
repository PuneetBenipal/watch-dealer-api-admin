import React, { createContext, useContext, useMemo, useState } from "react";
import { setAuthToken } from "../services/http";

const initialState = {
    jwtToken: "",
    user: null,
    loading: false,
}

export const AuthCtx = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    const [state, setState] = useState(initialState)

    const login = (u, t) => { setUser(u); setToken(t); setAuthToken(t); };
    const logout = () => { setUser(null); setToken(null); setAuthToken(null); };

    const updateState = (newState) => {
        setState((prevState) => ({ ...prevState, ...newState }));
    }

    const value = useMemo(() => ({
        user, token, login, logout, state, setState, updateState,
        isSuperAdmin: !!user && user.role === "superadmin",
    }), [user, token]);

    return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);