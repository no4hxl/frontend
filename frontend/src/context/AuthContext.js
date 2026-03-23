/**
 * @file AuthContext.js
 * @description Centralized Authentication & Authorization State Management for the React Frontend.
 * Uses React Context API to provide user identity, roles, and auth methods (login/logout) 
 * across the entire component tree.
 */

import React, { createContext, useState, useContext } from 'react';
import { authAPI } from '../services/api';

/**
 * @context AuthContext
 * @description The raw React context object for authentication data.
 */
const AuthContext = createContext(null);

/**
 * @component AuthProvider
 * @description Provider component that encapsulates the application and manages
 * authentication lifecycle, persistence, and role-based logic.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Sub-components requiring access to auth state.
 */
export const AuthProvider = ({ children }) => {
    
    /**
     * @function normalizeUser
     * @private
     * @description Sanitizes and standardizes incoming user data from the API.
     * Prevents common bugs related to trailing spaces or inconsistent casing in roles.
     * 
     * @param {Object} userData - Raw user object from server/storage.
     * @returns {Object|null} Normalized user object.
     */
    const normalizeUser = (userData) => {
        if (!userData) return null;
        return {
            ...userData,
            role: userData.role ? userData.role.toLowerCase().trim() : null
        };
    };

    /**
     * @state user
     * @description Core authentication state. 
     * Initialized via a lazy initializer function to safely restore session from localStorage.
     */
    const [user, setUser] = useState(() => {
        const savedUserData = localStorage.getItem('lecture_auth_user');
        const token = localStorage.getItem('lecture_auth_token');
        
        // Re-hydrate session if both user data and JWT token exist
        if (savedUserData && token) {
            try {
                const parsedUser = JSON.parse(savedUserData);
                return {
                    ...normalizeUser(parsedUser),
                    isAuthenticated: true
                };
            } catch (e) {
                console.error("[AuthContext] hydration failure:", e);
                // Fallback to guest state on corruption
            }
        }
        
        // Initial / Guest state definition
        return {
            email: null,
            name: null,
            role: null,
            isAuthenticated: false
        };
    });

    /**
     * @function login
     * @description Performs secure authentication via the backend API.
     * Synchronizes React state with local browser storage on success.
     * 
     * @async
     * @param {string} email - User's unique identifier.
     * @param {string} password - User's plaintext credentials.
     * @returns {Promise<{success: boolean, user?: Object, message?: string}>} 
     */
    const login = async (email, password) => {
        try {
            // API call to backend authentication endpoint
            const response = await authAPI.login({ email, password });
            const { token, user: userData } = response.data;

            const finalUser = {
                ...normalizeUser(userData),
                isAuthenticated: true
            };

            // 1. Update In-Memory React State
            setUser(finalUser);
            
            // 2. Persist to LocalStorage for session continuity across tabs/refreshes
            localStorage.setItem('lecture_auth_token', token);
            localStorage.setItem('lecture_auth_user', JSON.stringify(finalUser));
            
            console.log(`[AuthContext] Login successful for: ${finalUser.email}`);
            return { success: true, user: finalUser };
        } catch (error) {
            console.error("[AuthContext] Auth logic failed:", error);
            return { 
                success: false, 
                message: error.response?.data?.message || "Login failed. Please check your credentials." 
            };
        }
    };

    /**
     * @function logout
     * @description Resets authentication state and purges sensitive tokens from the browser.
     */
    const logout = () => {
        const resetUser = {
            email: null,
            name: null,
            role: null,
            isAuthenticated: false
        };
        
        // Purge state
        setUser(resetUser);
        
        // Purge storage
        localStorage.removeItem('lecture_auth_token');
        localStorage.removeItem('lecture_auth_user');
        
        console.log("[AuthContext] User logged out successfully.");
    };

    /**
     * DERIVED PERMISSIONS
     * Simplified boolean flags for cleaner conditional rendering in the UI.
     */
    const isAdmin = user.isAuthenticated && user.role === 'admin';
    const isLecturer = user.isAuthenticated && user.role === 'lecturer';

    return (
        <AuthContext.Provider value={{ user, login, logout, isAdmin, isLecturer }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * @hook useAuth
 * @description Custom hook providing a safe and type-safe interface for components 
 * to consume the AuthContext.
 * 
 * @throws {Error} If called outside of an <AuthProvider> wrapper.
 * @returns {Object} { user, login, logout, isAdmin, isLecturer }
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider subtree.');
    }
    return context;
};

export default AuthContext;



