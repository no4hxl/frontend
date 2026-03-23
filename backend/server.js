/**
 * @file server.js
 * @description Entry point for the Lecture Schedule Application Backend.
 * Responsible for environment configuration, database connection, middleware setup,
 * and API route registration.
 * 
 * @author Senior Software Engineer
 * @version 1.0.0
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDB } = require('./models/index');

// Load environment variables from .env file to process.env
// This ensures sensitive data like database URLs and secrets are managed externally.
dotenv.config();

/**
 * Database Initialization
 * Synchronizes models and verifies connectivity before starting the server.
 * Skips in 'test' environment to avoid conflicts with automated test cleanup.
 */
if (process.env.NODE_ENV !== 'test') {
    initDB()
        .then(() => console.log('[System] Database initialization complete.'))
        .catch(err => console.error('[Error] Database initialization failed:', err));
}

// Import API Route Controllers
// Divided by domain (Authentication, General Data, Schedules, User Management)
const authRoutes = require('./routes/authRoutes');
const dataRoutes = require('./routes/dataRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

/**
 * Global Middleware Configuration
 */

// Enable Cross-Origin Resource Sharing (CORS) 
// Crucial for allowing the frontend (React) to communicate with this API.
app.use(cors());

// Internal Express Middleware for parsing incoming request payloads
// Limits size and parses JSON for easy access in req.body
app.use(express.json({ limit: '10mb' }));

/**
 * Primary API Route Definitions
 * Each base path maps to a specific domain router for cleaner organization.
 */
app.use('/api/auth', authRoutes);         // Public auth endpoints (Login/Register)
app.use('/api/data', dataRoutes);         // Resource endpoints (Venues, Depts, etc.)
app.use('/api/schedules', scheduleRoutes);   // Core scheduling logic and conflict checks
app.use('/api/users', userRoutes);         // Admin-only user management tools

/**
 * Health Check Endpoint
 * Simple GET route to verify the API server is responsive.
 * Useful for monitoring and infrastructure heartbeats.
 * 
 * @name HealthCheck
 * @path {GET} /
 */
app.get('/', (req, res) => {
    res.status(200).json({ 
        status: "Online",
        message: "Welcome to the Lecture Schedule API",
        timestamp: new Date().toISOString()
    });
});

/**
 * Application Startup Logic
 * Listen on defined PORT or default to 5000.
 * Server listening is skipped in 'test' environment to prevent EADDRINUSE errors during tests.
 */
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`[Server] Listening on Port: ${PORT}`);
        console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}

// Export app for integration testing (e.g., using Supertest)
module.exports = app;


