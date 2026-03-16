const jwt = require('jsonwebtoken');

/**
 * authMiddleware.js
 * Contains security middleware to protect routes and verify user identities.
 */

/**
 * protect
 * Middleware to verify the JWT token provided in the Authorization header.
 * If valid, it attaches the decoded user payload to the request object (req.user).
 * 
 * @param {Object} req - Request object.
 * @param {Object} res - Response object.
 * @param {Function} next - Express next middleware function.
 */
const protect = (req, res, next) => {
    let token;

    // Check for "Bearer <token>" in the Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract the token part
            token = req.headers.authorization.split(' ')[1];
            
            // Verify signed token against the secret
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
            
            // Inject decoded user data (id, role, name) into the request object
            req.user = decoded;
            next();
        } catch (error) {
            console.error("Auth Middleware Error:", error);
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        res.status(401).json({ message: "Not authorized, no token" });
    }
};

/**
 * authorize
 * Middleware to restrict route access to specific user roles.
 * Must be used AFTER the 'protect' middleware.
 * 
 * @param {...string} roles - List of roles permitted to access the route.
 * @returns {Function} Middleware function.
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        // Check if the verified user's role is in the list of allowed roles
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Role ${req.user.role} is not authorized to access this route` });
        }
        next();
    };
};

module.exports = { protect, authorize };

