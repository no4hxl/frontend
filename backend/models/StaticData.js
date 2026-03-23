/**
 * @file StaticData.js
 * @description Domain models for organizational classifications.
 * Defines simple lookup tables for Departments, Venues, and Levels.
 * 
 * Design Pattern:
 * These models use a unified single-field (name) identity for simplicity in 
 * administrative UI management while maintaining relational integrity.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * @model Department
 * @description Academic or organizational unit (e.g., "Computer Science").
 */
const Department = sequelize.define('Department', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
});

/**
 * @model Venue
 * @description Physical classroom or facility (e.g., "Main Hall").
 * Linked with schedules for occupancy tracking and conflict detection.
 */
const Venue = sequelize.define('Venue', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
});

/**
 * @model Level
 * @description Student cohort classification (e.g., "100 Level").
 */
const Level = sequelize.define('Level', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
});

module.exports = { Department, Venue, Level };


