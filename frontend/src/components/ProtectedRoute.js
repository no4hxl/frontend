/**
 * @file ProtectedRoute.js
 * @description Higher-Order Component (HOC) for declarative routing security.
 * Intercepts navigation to private routes and enforces authentication & authorization rules.
 * 
 * Flow:
 * 1. Verify Authentication Status (JWT validity).
 * 2. Validate Authorization (Role-Based Access Control).
 * 3. Handle Redirection with history preservation.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * @component ProtectedRoute
 * @description Wraps sensitive components to prevent unauthorized access.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The target component/page to secure.
 * @param {string} [props.requiredRole] - Optional permission level (e.g., 'admin', 'lecturer').
 */
const ProtectedRoute = ({ children, requiredRole }) => {
    
    /** 
     * @context user
     * @description Destructured auth state from the global provider.
     */
    const { user } = useAuth();
    
    /** 
     * @hook useLocation
     * @description Captured current path to allow "deep linking" after login.
     */
    const location = useLocation();

    // PHASE 1: Authentication Guard
    if (!user.isAuthenticated) {
        /**
         * Not signed in: Redirect to login.
         * 'state' prop allows the login page to redirect the user back to their original 
         * destination (location.pathname) after successful entry.
         */
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // PHASE 2: Authorization (RBAC) Guard
    if (requiredRole) {
        // Normalization: Ensure canonical comparison by trimming and lowercasing roles.
        const userRole = user.role ? user.role.toLowerCase().trim() : '';
        const targetRole = requiredRole.toLowerCase().trim();

        if (userRole !== targetRole) {
            /**
             * Signed in but insufficient permissions: Safe redirect to Home.
             * This prevents accidental access to the Dashboard from a Student account.
             */
            console.warn(`[Guard Security] Unauthorized Access Attempt to ${location.pathname}. Path requires "${targetRole}", user is "${userRole}".`);
            return <Navigate to="/" replace />;
        }
    }

    // PHASE 3: Content Approval
    return children;
};

export default ProtectedRoute;


