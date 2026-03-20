const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const { loginRules } = require('../middleware/validator');

// POST /api/auth/login
router.post('/login', loginRules, login);

module.exports = router;
