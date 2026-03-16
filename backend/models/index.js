const sequelize = require('../config/database');
const User = require('./User');
const Course = require('./Course');
const { Department, Venue, Level } = require('./StaticData');
const Schedule = require('./Schedule');

/**
 * models/index.js
 * Centralizes all Sequelize models and defines their relationships (associations).
 * Also provides an initialization function to sync models with the database.
 */

// --- RELATIONSHIP DEFINITIONS ---

// 1. Department <-> Course (One-to-Many)
Department.hasMany(Course);
Course.belongsTo(Department);

// 2. Department <-> Schedule (One-to-Many)
Department.hasMany(Schedule);
Schedule.belongsTo(Department);

// 3. Level <-> Schedule (One-to-Many)
Level.hasMany(Schedule);
Schedule.belongsTo(Level);

// 4. Course <-> Schedule (One-to-Many)
Course.hasMany(Schedule);
Schedule.belongsTo(Course);

// 5. User (Lecturer) <-> Schedule (One-to-Many)
User.hasMany(Schedule, { foreignKey: 'lecturerId' });
Schedule.belongsTo(User, { as: 'lecturer', foreignKey: 'lecturerId' });

// 6. Venue <-> Schedule (One-to-Many)
Venue.hasMany(Schedule);
Schedule.belongsTo(Venue);

/**
 * initDB
 * Establishes connection to the database and synchronizes the models.
 * @async
 */
const initDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('--- Database Connected Successfully ---');
        
        // sync({ alter: true }) attempts to update existing tables without dropping data
        await sequelize.sync({ alter: true });
        console.log('--- Models Synchronized ---');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

module.exports = {
    initDB,
    User,
    Course,
    Department,
    Venue,
    Level,
    Schedule
};

