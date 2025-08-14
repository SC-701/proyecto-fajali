import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../API/Register.js';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const checkAuth = () => {
            const token = localStorage.getItem("token");
            const isAuth = localStorage.getItem("isAuthenticated");
            const userData = localStorage.getItem("user");

            if (token && isAuth === "true") {
                setIsAuthenticated(true);
                if (userData) {
                    setUser(userData);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (username, password) => {
        setLoading(true);
        try {
            const result = await loginUser(username, password);

            if (result.success) {
                localStorage.setItem("isAuthenticated", "true");
                localStorage.setItem("token", result.data.accessToken);

                if (result.data.user) {
                    localStorage.setItem("user", result.data.user);
                    setUser(result.data.user);
                }

                setIsAuthenticated(true);
            }
            return result;
        } finally {
            setLoading(false);
        }
    };

    const register = async (username, password, email) => {
        return await registerUser(username, password, email);
    };

    const logout = () => {
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setUser(null);
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};