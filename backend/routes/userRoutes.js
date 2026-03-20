const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole, resetUserPassword, deleteUser, addUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { userRules } = require('../middleware/validator');

/**
 * userRoutes.js
 * Handles endpoints for administrative user management (creating users, roles, password resets).
 */

// Applying global protection: All routes in this file require authentication and Admin status
router.use(protect);
router.use(authorize('admin'));

// Map routes to controller actions
router.get('/', getAllUsers);                // List all users
router.post('/', userRules, addUser);        // Create a new user
router.put('/:id/role', updateUserRole);     // Change user permission level
router.put('/:id/reset-password', resetUserPassword); // Administrative password override
router.delete('/:id', deleteUser);           // Remove a user account

module.exports = router;

