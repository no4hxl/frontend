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
        const { day, startTime, endTime, courseCode, lecturerId, venueId, levelId, departmentId } = req.body;

        /**
         * Overlap Logic: (StartA < EndB) AND (EndA > StartB)
         * This checks if the new time range overlaps with any existing record on the same day.
         */
        const timeOverlapFilter = {
            day,
            [Op.and]: [
                { startTime: { [Op.lt]: endTime } },
                { endTime: { [Op.gt]: startTime } }
            ]
        };

        // 1. Unified Conflict Check: Venue, Lecturer, or Student Group (Level+Dept)
        const conflict = await Schedule.findOne({
            where: {
                ...timeOverlapFilter,
                [Op.or]: [
                    { VenueId: venueId },
                    { lecturerId: lecturerId },
                    { 
                        [Op.and]: [
                            { LevelId: levelId },
                            { DepartmentId: departmentId }
                        ]
                    }
                ]
            }
        });

        if (conflict) {
            return res.status(400).json({ 
                message: "Schedule conflict detected for venue, lecturer, or student group at this time." 
            });
        }

        // 4. Create the schedule entry after all checks pass
        const newSchedule = await Schedule.create({
            day,
            startTime,
            endTime,
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

