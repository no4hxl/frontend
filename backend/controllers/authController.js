/**
 * @file authController.js
 * @description Controller handling secure user authentication.
 * Manages identity verification, credential checking, and JWT generation.
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models/index');

/**
 * @function login
 * @description authenticates a user and provides a session token.
 * 
 * Flow:
 * 1. Find user by unique email.
 * 2. Compare incoming plaintext password with stored bcrypt hash.
 * 3. On match, sign a JWT with user metadata (id, name, role).
 * 4. Issue token to client for subsequent authorized requests.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Object containing 'email' and 'password'.
 * @param {Object} res - Express response object.
 * 
 * @returns {Promise<void>} Sends JWT and user profile or 401 Unauthorized.
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. IDENTITY LOOKUP
        // Fetch user record including the hashed password for comparison.
        const user = await User.findOne({ where: { email } });
        
        // Security Note: We use a generic message to prevent account enumeration attacks.
        if (!user) {
            console.warn(`[Auth] Failed login attempt: Email ${email} not found.`);
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 2. CREDENTIAL VERIFICATION
        // bcrypt.compare is resistant to timing attacks.
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.warn(`[Auth] Failed login attempt: Incorrect password for ${email}.`);
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 3. SESSION TOKEN GENERATION
        // We embed the user ID and Role so middleware can perform RBAC without a DB lookup.
        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name },
            process.env.JWT_SECRET || 'dev_secret_key_change_me_in_prod',
            { expiresIn: '24h' } // Standard 24-hour session window
        );

        // 4. RESPONSE
        // Return successful status with the token and non-sensitive user profile data.
        console.log(`[Auth] Successful login: ${user.email} (${user.role})`);
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("[AuthController] Login Error:", error);
        res.status(500).json({ message: "An internal error occurred during authentication" });
    }
};

module.exports = { login };


