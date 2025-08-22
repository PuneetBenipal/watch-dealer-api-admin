import { useContext, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthCtx } from '../contexts/AuthContext';
import { jwtDecode } from "jwt-decode";
import http, { setAuthToken } from '../services/http';
import { CustomToast } from '../components/common/CustomToast';


export const useAuth = () => {
    const { state, updateState } = useContext(AuthCtx);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        setAuth(token); 
        // http.get("/currency")
    }, [])

    const validateToken = async () => {
        const token = localStorage.getItem('token');
        try {
            if (!token) throw new Error("Token is expered. Please login again.")
            const res = await http.get('/api/auth/verify');

            updateState({ user: res.data.user });
        } catch (error) {
            console.log('Token invalid, clearing session');
            // localStorage.removeItem('token');
            updateState({ user: null });
            CustomToast.error(error.message);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await http.post('/superadmin/auth/login', { email, password });
            const { token, user: userData } = response.data;

            localStorage.setItem('token', token);
            setAuth(token);
            navigate("/dashboard", { replace: true });
        } catch (error) {
            console.error('Login error:', error.response.data.msg);
            CustomToast.error(error.response.data.msg)
        }
    };

    const setAuth = (token) => {
        try {
            if (!token) throw new Error("Token is invalid");
            const user = jwtDecode(token);
            console.log("user", user)
            updateState({ user: user, jwtToken: token });
            setAuthToken(token)
        } catch (error) {
            console.log("useAuth error", error)
            updateState({ user: null, jwtToken: "" });
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
    }

    const logout = () => {
        setAuth(null);
        window.location.href = '/login';
    };


    const user = state.user;
    const isAuth = !!state.jwtToken;
    const isSuperAdmin = useMemo(() => {
        return user?.role === "superadmin"
    }, [user])

    return {
        state,
        setAuth,
        updateState,
        user,
        isSuperAdmin,
        isAuth,
        login,
        logout,
    }

};

export default useAuth; 