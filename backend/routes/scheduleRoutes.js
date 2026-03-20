const express = require('express');
const router = express.Router();
const { getSchedules, createSchedule, deleteSchedule } = require('../controllers/scheduleController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { scheduleRules } = require('../middleware/validator');

// Public route: fetching schedules
router.get('/', getSchedules);

// Protected routes: Creating/Deleting requires authentication
router.post('/', protect, authorize('admin', 'lecturer'), scheduleRules, createSchedule);
router.delete('/:id', protect, authorize('admin', 'lecturer'), deleteSchedule);

module.exports = router;
