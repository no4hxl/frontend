const { body, validationResult } = require('express-validator');

/**
 * validator.js
 * Centralized middleware for validating incoming request data using express-validator.
 * Enhances security by ensuring all inputs match expected types, formats, and constraints.
 */

/**
 * Common middleware to catch validation errors and return a 400 response.
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const firstError = errors.array()[0].msg;
        return res.status(400).json({ 
            message: firstError, // Use the first specific error as the main message
            errors: errors.array().map(err => ({ field: err.path, message: err.msg })) 
        });
    }
    next();
};

/**
 * Auth Rules
 */
const loginRules = [
    body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    validate
];

/**
 * User Rules (Admin Only)
 */
const userRules = [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    body('role').isIn(['admin', 'lecturer']).withMessage('Role must be either admin or lecturer'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    validate
];

/**
 * Schedule Rules
 */
const scheduleRules = [
    body('day').isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).withMessage('Invalid day selected'),
    body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:mm format'),
    body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:mm format'),
    body('endTime').custom((value, { req }) => {
        if (value <= req.body.startTime) {
            throw new Error('End time must be after start time');
        }
        return true;
    }),
    body('courseCode').notEmpty().withMessage('Course code is required'),
    body('venueId').notEmpty().withMessage('Venue is required'),
    body('levelId').notEmpty().withMessage('Academic level is required'),
    body('departmentId').notEmpty().withMessage('Department is required'),
    validate
];

/**
 * Static Data Rules (Generic)
 */
const staticDataRules = [
    body('name').trim().notEmpty().withMessage('Name field cannot be empty'),
    validate
];

module.exports = {
    loginRules,
    userRules,
    scheduleRules,
    staticDataRules
};
