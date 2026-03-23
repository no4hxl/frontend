/**
 * @file authRoutes.js
 * @description API Routes for user authentication.
 */

const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const { loginRules } = require('../middleware/validator');

/**
 * @route   POST /api/auth/login
 * @desc    Authenticates a user and returns a JWT session token.
 * @access  Public
 * @middleware loginRules - Input validation and sanitation.
 */
router.post('/login', loginRules, login);

module.exports = router;

