const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models/index');

/**
 * authController.js
 * Handles user authentication logic.
 */

/**
 * Handles User Login
 * 1. Validates user credentials.
 * 2. Generates a signed JWT token if credentials are valid.
 * 3. Returns user profile and token.
 * 
 * @param {Object} req - Express request object containing email and password.
 * @param {Object} res - Express response object.
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user by email in the database
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 2. Verify hashed password using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 3. Generate JWT Token containing user metadata
        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '24h' }
        );

        // 4. Send successful response with token and minimal user info
        res.json({
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
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { login };

