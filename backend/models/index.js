/**
 * @file models/index.js
 * @description Centralized data access layer. Responsible for model registration,
 * establishing database associations (Foreign Keys), and bootstrapping the connection.
 * 
 * Relationships:
 * - Department -> Course (One-to-Many)
 * - Department -> Schedule (One-to-Many)
 * - Level -> Schedule (One-to-Many)
 * - Course -> Schedule (One-to-Many)
 * - User (Lecturer) -> Schedule (One-to-Many)
 * - Venue -> Schedule (One-to-Many)
 */

const sequelize = require('../config/database');
const User = require('./User');
const Course = require('./Course');
const { Department, Venue, Level } = require('./StaticData');
const Schedule = require('./Schedule');

/**
 * --- DATA RELATIONSHIP LAYER ---
 * We define associations here rather than inside individual model files to avoid
 * circular dependency issues during initialization.
 */

// 1. Departmental Organizational Structure
Department.hasMany(Course);
Course.belongsTo(Department);

// 2. Schedule Constraints & Context
Department.hasMany(Schedule);
Schedule.belongsTo(Department);

Level.hasMany(Schedule);
Schedule.belongsTo(Level);

Course.hasMany(Schedule);
Schedule.belongsTo(Course);

// 3. Lecturer Assignment (User Model with role 'lecturer')
User.hasMany(Schedule, { foreignKey: 'lecturerId' });
Schedule.belongsTo(User, { as: 'lecturer', foreignKey: 'lecturerId' });

// 4. Physical Location Mapping
Venue.hasMany(Schedule);
Schedule.belongsTo(Venue);

/**
 * @function initDB
 * @description Bootstraps the database connection and synchronizes models.
 * In a production environment, 'force: true' should NEVER be used.
 * 
 * @async
 * @throws {Error} If connection or synchronization fails.
 */
const initDB = async () => {
    try {
        // Test connectivity
        await sequelize.authenticate();
        console.log('[Database] Connection established successfully.');
        
        // Environment awareness:
        // 'test' -> force: true (wipes DB for clean testing state)
        // 'development' -> alter: true (attempts to migrate table schemas without data loss)
        const isTest = process.env.NODE_ENV === 'test';
        await sequelize.sync({ 
            force: isTest, 
            alter: !isTest 
        });

        console.log(`[Database] Models synchronized [Mode: ${isTest ? 'WIPE' : 'UPDATE'}]`);
    } catch (error) {
        console.error('[Database] CRITICAL: Initialization failure:', error);
        throw error; // Re-throw to allow process-level error handling
    }
};

/**
 * @exports DatabaseEntities
 * @description Exported object containing the sync function and all registered models.
 */
module.exports = {
    initDB,
    User,
    Course,
    Department,
    Venue,
    Level,
    Schedule
};


