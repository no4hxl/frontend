const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * User Model
 * Represents anyone who can log into the system (Admins, Lecturers, Students).
 * Stores credentials and assigned system roles.
 */
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // Full display name of the user
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // Unique email used for authentication
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    // Bcrypt hashed password
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    /**
     * Role determines access levels:
     * - admin: Can manage all data and users.
     * - lecturer: Can schedule and manage their own classes.
     * - student: View-only access (default).
     */
    role: {
        type: DataTypes.ENUM('admin', 'lecturer', 'student'),
        defaultValue: 'student'
    }
});

module.exports = User;

