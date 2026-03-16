import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * 
 * Secures a route by checking authentication status and optional role requirements.
 * Using case-insensitive comparisons for roles to ensure reliability.
 * 
 * @param {React.ReactNode} children - The component to render if authorized
 * @param {string} requiredRole - Optional role requirement ('admin' or 'lecturer')
 */
const ProtectedRoute = ({ children, requiredRole }) => {
    const { user } = useAuth();
    const location = useLocation();

    // 1. Check if user is authenticated
    if (!user.isAuthenticated) {
        // Redirect to login page, saving the current location for POST-login redirect
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. Check Role Requirement (if specified)
    if (requiredRole) {
        const userRole = user.role?.toLowerCase().trim();
        const targetRole = requiredRole.toLowerCase().trim();

        if (userRole !== targetRole) {
            // Log rejection for debugging purposes (often role casing issues)
            console.warn(`Access Denied: Path requires "${targetRole}" role, but user has "${userRole}". Redirecting to Home.`);
            
            // Authorized but lacks permissions: Redirect to safe default (Home)
            return <Navigate to="/" replace />;
        }
    }

    // 3. Authorized - render the protected content
    return children;
};

export default ProtectedRoute;

