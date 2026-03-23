/**
 * @file userRoutes.js
 * @description Administrative User Management Routes.
 * All routes in this domain are restricted to users with the 'admin' role.
 */

const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole, resetUserPassword, deleteUser, addUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { userRules } = require('../middleware/validator');

/**
 * @middleware SECURITY_GATE
 * All user management routes REQUIRE:
 * 1. A valid JWT (protect)
 * 2. Administrative privileges (authorize('admin'))
 */
router.use(protect);
router.use(authorize('admin'));

/**
 * @route   GET /api/users
 * @desc    Fetch a list of all registered users.
 */
router.get('/', getAllUsers);

/**
 * @route   POST /api/users
 * @desc    Create a new user account (Lecturer or Admin).
 * @middleware userRules - Joi/Validator check for required fields and formats.
 */
router.post('/', userRules, addUser);

/**
 * @route   PUT /api/users/:id/role
 * @desc    Update the authorization role of a specific user.
 */
router.put('/:id/role', updateUserRole);

/**
 * @route   PUT /api/users/:id/reset-password
 * @desc    Resets a user's password to the system default.
 */
router.put('/:id/reset-password', resetUserPassword);

/**
 * @route   DELETE /api/users/:id
 * @desc    Permanently delete a user account.
 */
router.delete('/:id', deleteUser);

module.exports = router;


