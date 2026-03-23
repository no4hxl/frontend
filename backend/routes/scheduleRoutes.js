/**
 * @file scheduleRoutes.js
 * @description Defines the API endpoints for lecture schedule management.
 * Integration point for routing, authentication middleware, and validation rules.
 */

const express = require('express');
const router = express.Router();
const { getSchedules, createSchedule, deleteSchedule } = require('../controllers/scheduleController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { scheduleRules } = require('../middleware/validator');

/**
 * @route   GET /api/schedules
 * @desc    Fetch lists of schedules. Supports filtering via Query Params.
 * @access  Public
 */
router.get('/', getSchedules);

/**
 * @route   POST /api/schedules
 * @desc    Submit a new lecture schedule.
 * @access  Protected (Admin, Lecturer)
 * @middleware protect - Verifies JWT identity.
 * @middleware authorize - Ensures user has appropriate role.
 * @middleware scheduleRules - Performs Joi/Express-validator input sanity checks.
 */
router.post('/', protect, authorize('admin', 'lecturer'), scheduleRules, createSchedule);

/**
 * @route   DELETE /api/schedules/:id
 * @desc    Remove an existing lecture schedule.
 * @access  Protected (Admin, Lecturer)
 * @param   {string} id - The database ID of the schedule to delete.
 */
router.delete('/:id', protect, authorize('admin', 'lecturer'), deleteSchedule);

module.exports = router;

