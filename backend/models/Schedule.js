const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Schedule Model
 * Represents a single lecture slot in the timetable.
 * Links together Course, Lecturer, Venue, Department, and Level.
 */
const Schedule = sequelize.define('Schedule', {
    // Day of the week (e.g., "Monday")
    day: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // Start Time (e.g., "08:00")
    startTime: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // End Time (e.g., "10:00")
    endTime: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Schedule;

