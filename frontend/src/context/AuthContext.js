import React, { createContext, useState, useContext } from 'react';
import { authAPI } from '../services/api';

/**
 * AuthContext.js
 * 
 * Central State Management for Authentication.
 * This context provides the current authenticated user's data and 
 * essential methods (login, logout) to the entire application.
 */
const AuthContext = createContext(null);

/**
 * AuthProvider
 * Wrapper component that provides the AuthContext to its children.
 * Handles persistence via localStorage and role normalization.
 */
export const AuthProvider = ({ children }) => {
    /**
     * Helper to normalize user data.
     * Ensures roles are consistently lowercase and trimmed to prevent routing issues.
     */
    const normalizeUser = (userData) => {
        if (!userData) return null;
        return {
            ...userData,
            role: userData.role ? userData.role.toLowerCase().trim() : null
        };
    };

    /**
     * User State
     * Initialized by checking 'lecture_auth_user' and 'lecture_auth_token' in localStorage.
     * This ensures the user stays logged in across page refreshes.
     */
    const [user, setUser] = useState(() => {
        const savedUserData = localStorage.getItem('lecture_auth_user');
        const token = localStorage.getItem('lecture_auth_token');
        
        if (savedUserData && token) {
            try {
                const parsedUser = JSON.parse(savedUserData);
                return {
                    ...normalizeUser(parsedUser),
                    isAuthenticated: true
                };
            } catch (e) {
                console.error("Failed to parse saved user", e);
            }
        }
        
        // Default guest state
        return {
            email: null,
            name: null,
            role: null,
            isAuthenticated: false
        };
    });

    /**
     * login
     * Authenticates credentials against the backend.
     * On success: Updates state, stores token/user in localStorage.
     * 
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<Object>} Object indicating success or failure message.
     */
    const login = async (email, password) => {
        try {
            const response = await authAPI.login({ email, password });
            const { token, user: userData } = response.data;

            const finalUser = {
                ...normalizeUser(userData),
                isAuthenticated: true
            };

            setUser(finalUser);
            localStorage.setItem('lecture_auth_token', token);
            localStorage.setItem('lecture_auth_user', JSON.stringify(finalUser));
            
            return { success: true, user: finalUser };
        } catch (error) {
            console.error("Login failed:", error);
            return { 
                success: false, 
                message: error.response?.data?.message || "Login failed. Please check your credentials." 
            };
        }
    };

    /**
     * logout
     * Clears user state and removes authentication data from the browser.
     */
    const logout = () => {
        const resetUser = {
            email: null,
            name: null,
            role: null,
            isAuthenticated: false
        };
        setUser(resetUser);
        localStorage.removeItem('lecture_auth_token');
        localStorage.removeItem('lecture_auth_user');
    };

    // Helper derived booleans for cleaner role-based rendering in components
    const isAdmin = user.isAuthenticated && user.role === 'admin';
    const isLecturer = user.isAuthenticated && user.role === 'lecturer';

    return (
        <AuthContext.Provider value={{ user, login, logout, isAdmin, isLecturer }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * useAuth
 * Custom hook for easy access to AuthContext.
 * Usage: const { user, login, logout } = useAuth();
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;


