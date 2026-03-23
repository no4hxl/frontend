/**
 * @file Course.js
 * @description Catalog record for academic courses. 
 * Linked to schedules to denote which subject is being taught.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * @model Course
 * @description Identity for institutional courses.
 */
const Course = sequelize.define('Course', {
    /** 
     * @property code
     * @description Natural primary key (e.g., 'CSC101'). 
     */
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true
    },

    /** 
     * @property title
     * @description Descriptive course title (e.g., 'Introduction to Computer Science').
     */
    title: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Course;

