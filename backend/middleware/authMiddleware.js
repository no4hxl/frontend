/**
 * @file authMiddleware.js
 * @description Security layer for the Express API.
 * Provides JWT validation and Role-Based Access Control (RBAC) middleware.
 */

const jwt = require('jsonwebtoken');

/**
 * @function protect
 * @description Authentication gatekeeper. Verifies the caller's identity via JWT.
 * 
 * Logic:
 * 1. Extract Bearer token from the 'Authorization' header.
 * 2. Verify signature using the system's JWT_SECRET.
 * 3. On success: Decodes payload and attaches to 'req.user' for downstream use.
 * 4. On failure: Halts request with 401 Unauthorized.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next() callback.
 */
const protect = (req, res, next) => {
    let token;

    // Check for "Bearer <token>" in the Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract the token part (strip 'Bearer ')
            token = req.headers.authorization.split(' ')[1];
            
            // Verify signed token against the secret
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key_change_me_in_prod');
            
            /**
             * Decoded payload typically contains:
             * { id: 1, role: 'admin', name: 'John Doe', iat: ..., exp: ... }
             */
            req.user = decoded;
            
            return next(); // Proceed to the next middleware or controller
        } catch (error) {
            console.error("[Security] JWT Verification Failed:", error.message);
            return res.status(401).json({ message: "Not authorized: Session invalid or expired." });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized: Authentication token missing." });
    }
};

/**
 * @function authorize
 * @description Authorization gatekeeper. Restricts access based on user roles.
 * Must be used as a secondary check AFTER the 'protect' middleware.
 * 
 * Usage: router.get('/admin-only', protect, authorize('admin'), controller.method);
 * 
 * @param {...string} roles - Spread array of permitted roles (e.g., 'admin', 'lecturer').
 * @returns {Function} Express middleware function configured for specific roles.
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        // Verification: Check if the previously decoded 'req.user.role' matches any allowed role.
        if (!roles.includes(req.user.role)) {
            console.warn(`[Security] RBAC REJECTION: User ${req.user.id} (${req.user.role}) attempted restricted access.`);
            return res.status(403).json({ 
                status: "Forbidden",
                message: "Access Denied: You do not have the required permissions for this resource." 
            });
        }
        next();
    };
};

module.exports = { protect, authorize };


