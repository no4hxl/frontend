/**
 * @file scheduleController.js
 * @description Controller for managing lecture schedules.
 * This is the core engine of the application, handling complex scheduling
 * logic, multi-dimensional conflict detection, and role-based access control.
 * 
 * Conflict Detection Dimensions:
 * 1. Venue: Ensures no two classes occupy the same room at the same time.
 * 2. Lecturer: Ensures no lecturer is scheduled for two different classes at the same time.
 * 3. Student Group (Level + Department): Ensures students aren't expected in two places at once.
 */

const { Schedule, Course, User, Venue, Level, Department } = require('../models/index');
const { Op } = require('sequelize');

/**
 * @function getSchedules
 * @description Retrieves a list of schedules filtered by various parameters.
 * Uses Sequelize's 'include' for Eager Loading of related entities.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} req.query - Query filters: lecturerId, courseCode, levelId, departmentId, venueId.
 * @param {Object} res - Express response object.
 * 
 * @returns {Promise<void>} Sends JSON array of schedules.
 */
const getSchedules = async (req, res) => {
    try {
        const { lecturerId, courseCode, levelId, departmentId, venueId } = req.query;
        
        // Build dynamic filter object based on provided query parameters
        const whereClause = {};
        if (lecturerId) whereClause.lecturerId = lecturerId;
        if (courseCode) whereClause.CourseCode = courseCode;
        if (levelId) whereClause.LevelId = levelId;
        if (departmentId) whereClause.DepartmentId = departmentId;
        if (venueId) whereClause.VenueId = venueId;

        // Eager load all associations to minimize database round-trips
        const schedules = await Schedule.findAll({
            where: whereClause,
            include: [
                Course, 
                { model: User, as: 'lecturer', attributes: ['name'] }, 
                Venue, 
                Level, 
                Department
            ]
        });

        res.status(200).json(schedules);
    } catch (error) {
        console.error("[ScheduleController] Fetch Error:", error);
        res.status(500).json({ 
            message: "Failed to fetch schedules",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @function createSchedule
 * @description Validates and persists a new schedule entry.
 * Implements strict conflict detection to prevent overlapping bookings.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Schedule details: day, startTime, endTime, courseCode, etc.
 * @param {Object} res - Express response object.
 * 
 * @returns {Promise<void>} 201 on success, 400 on conflict, 500 on error.
 */
const createSchedule = async (req, res) => {
    try {
        const { 
            day, startTime, endTime, courseCode, lecturerId, venueId, levelId, departmentId 
        } = req.body;

        /**
         * OVERLAP ALGORITHM:
         * Two time ranges (A and B) overlap if:
         * (StartA < EndB) AND (EndA > StartB)
         * 
         * This logic catches:
         * - Complete overlap
         * - Partial overlap (start/end)
         * - Inner containment
         */
        const timeOverlapFilter = {
            day,
            [Op.and]: [
                { startTime: { [Op.lt]: endTime } },
                { endTime: { [Op.gt]: startTime } }
            ]
        };

        /**
         * SEARCH FOR CONFLICTS
         * We look for any existing schedule entry that overlaps in time AND 
         * shares the same Venue OR the same Lecturer OR the same Student Group.
         */
        const conflict = await Schedule.findOne({
            where: {
                ...timeOverlapFilter,
                [Op.or]: [
                    { VenueId: venueId },      // Physical resource clash
                    { lecturerId: lecturerId },// Human resource clash
                    { 
                        [Op.and]: [            // Consuming group clash
                            { LevelId: levelId }, 
                            { DepartmentId: departmentId }
                        ]
                    }
                ]
            }
        });

        if (conflict) {
            return res.status(400).json({ 
                status: "Conflict",
                message: "A schedule conflict exists for the selected venue, lecturer, or student group at this time." 
            });
        }

        // Persist the new schedule entry
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

        console.log(`[ScheduleController] New entry created: ID ${newSchedule.id}`);
        res.status(201).json(newSchedule);
    } catch (error) {
        console.error("[ScheduleController] Creation Error:", error);
        res.status(500).json({ message: "Internal error during schedule creation" });
    }
};

/**
 * @function deleteSchedule
 * @description Removes a schedule entry from the database.
 * Includes security checks to ensure users can only delete authorized records.
 * 
 * @param {Object} req - Express request object with 'id' param.
 * @param {Object} res - Express response object.
 * 
 * @returns {Promise<void>} 200 on success, 403 on permission denied, 404 on not found.
 */
const deleteSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const schedule = await Schedule.findByPk(id);
        
        if (!schedule) {
            return res.status(404).json({ message: "Target schedule entry not found" });
        }

        /**
         * SECURITY: Role-Based Logic
         * - Admins: Full override, can delete any schedule.
         * - Lecturers: restricted to their own schedules only.
         * Note: req.user is populated by the authMiddleware.
         */
        if (req.user.role === 'lecturer' && schedule.lecturerId !== req.user.id) {
            console.warn(`[Security] Unauthorized delete attempt by user ${req.user.id} on schedule ${id}`);
            return res.status(403).json({ 
                message: "Permission Denied: You are not authorized to cancel this class." 
            });
        }

        await schedule.destroy();
        res.status(200).json({ message: "Schedule entry successfully removed" });
    } catch (error) {
        console.error("[ScheduleController] Deletion Error:", error);
        res.status(500).json({ message: "Failed to remove schedule entry" });
    }
};

module.exports = { getSchedules, createSchedule, deleteSchedule };


