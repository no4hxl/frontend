/**
 * @file User.js
 * @description Database Schema for User Identity and Access Control.
 * Defines the structure for all system actors (Administrators, Lecturers, and Students).
 * 
 * Security Note:
 * Passwords stored here MUST be pre-hashed (e.g., via bcrypt) before persistence.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * @model User
 * @description Represents a registered user within the institutional hierarchy.
 */
const User = sequelize.define('User', {
    /** 
     * @property id
     * @description Primary surrogate key. 
     */
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    /** 
     * @property name
     * @description Full human-readable display name (e.g., "Dr. John Doe").
     */
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    /** 
     * @property email
     * @description Unique identifier for authentication and communication.
     * Includes built-in Sequelize validation for RFC 5322 compliance.
     */
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: {
                msg: "Must be a valid email address format."
            }
        }
    },

    /** 
     * @property password
     * @description Cryptographic hash of the user's secret credentials.
     * @security Store ONLY hashes, never plaintext.
     */
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },

    /** 
     * @property role
     * @description Permission discriminator. Controls RBAC (Role-Based Access Control) behavior.
     * - 'admin': Total system orchestration.
     * - 'lecturer': Teaching and schedule management.
     * - 'student': Timetable consumption and profile viewing.
     */
    role: {
        type: DataTypes.ENUM('admin', 'lecturer', 'student'),
        defaultValue: 'student'
    }
}, {
    // Standard timestamps (createdAt, updatedAt) for audit trails
    timestamps: true 
});

module.exports = User;


