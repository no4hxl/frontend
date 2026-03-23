/**
 * @file Schedule.js
 * @description Database Schema for Timetable Entries.
 * Each 'Schedule' instance represents a unique lecture block. 
 * Foreign keys (CourseId, UserId as Lecturer, VenueId, etc.) are injected 
 * by the association layer in models/index.js.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * @model Schedule
 * @description High-level representation of an academic booking.
 */
const Schedule = sequelize.define('Schedule', {
    /** 
     * @property day
     * @description Chronological context. Typically 'Monday' through 'Friday'.
     */
    day: {
        type: DataTypes.STRING,
        allowNull: false
    },

    /** 
     * @property startTime
     * @description Operational commencement in 24-hour format (HH:mm). 
     */
    startTime: {
        type: DataTypes.STRING,
        allowNull: false
    },

    /** 
     * @property endTime
     * @description Planned conclusion in 24-hour format (HH:mm).
     */
    endTime: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    // Indexes to optimize lookups in the scheduling engine
    indexes: [
        { fields: ['day'] }
    ]
});

module.exports = Schedule;


