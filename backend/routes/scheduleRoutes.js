const express = require('express');
const router = express.Router();
const { getSchedules, createSchedule, deleteSchedule } = require('../controllers/scheduleController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public route: fetching schedules
router.get('/', getSchedules);

// Protected routes: Creating/Deleting requires authentication
router.post('/', protect, authorize('admin', 'lecturer'), createSchedule);
router.delete('/:id', protect, authorize('admin', 'lecturer'), deleteSchedule);

module.exports = router;
