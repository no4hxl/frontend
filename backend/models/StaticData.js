const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * StaticData.js
 * Defines simple lookup models that only require a unique 'name' field.
 * These are used as foreign key targets for Schedules.
 */

// Represents an academic department (e.g., "Computer Science")
const Department = sequelize.define('Department', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
});

// Represents a physical location (e.g., "Lecture Theater A")
const Venue = sequelize.define('Venue', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
});

// Represents an academic level (e.g., "100", "200")
const Level = sequelize.define('Level', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
});

module.exports = { Department, Venue, Level };

