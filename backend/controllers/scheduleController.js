const { Schedule, Course, User, Venue, Level, Department } = require('../models/index');
const { Op } = require('sequelize');

/**
 * scheduleController.js
 * Handles the creation, retrieval, and deletion of lecture schedules.
 * Includes conflict detection logic to ensure venues and lecturers aren't double-booked.
 */

/**
 * Get all schedules with optional filters.
 * Returns schedules along with associated Course, Lecturer, Venue, Level, and Department data.
 * 
 * @param {Object} req - Request object with query params: lecturerId, courseCode, levelId, departmentId, venueId.
 * @param {Object} res - Response object.
 */
const getSchedules = async (req, res) => {
    try {
        const { lecturerId, courseCode, levelId, departmentId, venueId } = req.query;
        
        const whereClause = {};
        if (lecturerId) whereClause.lecturerId = lecturerId;
        if (courseCode) whereClause.CourseCode = courseCode;
        if (levelId) whereClause.LevelId = levelId;
        if (departmentId) whereClause.DepartmentId = departmentId;
        if (venueId) whereClause.VenueId = venueId;

        const schedules = await Schedule.findAll({
            where: whereClause,
            include: [Course, { model: User, as: 'lecturer', attributes: ['name'] }, Venue, Level, Department]
        });

        res.json(schedules);
    } catch (error) {
        console.error("Fetch Schedules Error:", error);
        res.status(500).json({ message: "Failed to fetch schedules" });
    }
};

/**
 * Create a new schedule entry with robust conflict detection.
 * Checks for:
 * 1. Venue being double-booked.
 * 2. Lecturer having overlapping classes.
 * 3. Specific Level/Department having overlapping classes (student clash).
 * 
 * @param {Object} req - Request body containing day, timeSlot, courseCode, lecturerId, venueId, levelId, and departmentId.
 * @param {Object} res - Response object.
 */
const createSchedule = async (req, res) => {
    try {
        const { day, timeSlot, courseCode, lecturerId, venueId, levelId, departmentId } = req.body;

        // 1. Conflict Check: Venue at the same time and day
        const venueConflict = await Schedule.findOne({
            where: { day, timeSlot, VenueId: venueId }
        });
        if (venueConflict) {
            return res.status(409).json({ message: "Conflict: Venue is already booked for this time slot." });
        }

        // 2. Conflict Check: Lecturer already booked for this day/time
        const lecturerConflict = await Schedule.findOne({
            where: { day, timeSlot, lecturerId }
        });
        if (lecturerConflict) {
            return res.status(409).json({ message: "Conflict: Lecturer already has another class scheduled at this time." });
        }

        // 3. Conflict Check: Resource clash for students (Same Level and Department)
        const studentConflict = await Schedule.findOne({
            where: { day, timeSlot, LevelId: levelId, DepartmentId: departmentId }
        });
        if (studentConflict) {
            return res.status(409).json({ message: "Conflict: This Level/Department already has a class scheduled at this time." });
        }

        // 4. Create the schedule entry after all checks pass
        const newSchedule = await Schedule.create({
            day,
            timeSlot,
            CourseCode: courseCode,
            lecturerId,
            VenueId: venueId,
            LevelId: levelId,
            DepartmentId: departmentId
        });

        res.status(201).json(newSchedule);
    } catch (error) {
        console.error("Create Schedule Error:", error);
        res.status(500).json({ message: "Failed to create schedule" });
    }
};

/**
 * Delete a schedule entry.
 * Enforces permissions: Lecturers can only delete their own entries.
 * 
 * @param {Object} req - Request object with route param 'id'.
 * @param {Object} res - Response object.
 */
const deleteSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const schedule = await Schedule.findByPk(id);
        
        if (!schedule) {
            return res.status(404).json({ message: "Schedule not found" });
        }

        // RBAC: If user is a lecturer, verify they own this particular schedule entry
        if (req.user.role === 'lecturer' && schedule.lecturerId !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized: You can only cancel your own classes." });
        }

        await schedule.destroy();
        res.json({ message: "Schedule cancelled successfully" });
    } catch (error) {
        console.error("Delete Schedule Error:", error);
        res.status(500).json({ message: "Failed to delete schedule" });
    }
};

module.exports = { getSchedules, createSchedule, deleteSchedule };

