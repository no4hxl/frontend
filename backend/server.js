const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDB } = require('./models/index');

/**
 * server.js
 * Entry point for the Node.js/Express backend API.
 * Handles environment setup, database initialization, middleware, and routing.
 */

// Load environment variables from .env file
dotenv.config();

// Initialize Database connection and sync models
initDB();

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const dataRoutes = require('./routes/dataRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

/**
 * Global Middleware
 */
app.use(cors()); // Enable Cross-Origin Resource Sharing for frontend access
app.use(express.json()); // Parse incoming JSON request bodies

/**
 * Route Definitions
 */
app.use('/api/auth', authRoutes);       // Authentication (Login/Register)
app.use('/api/data', dataRoutes);       // Generic Data CRUD (Depts, Venues, etc.)
app.use('/api/schedules', scheduleRoutes); // Schedule management and conflict detection
app.use('/api/users', userRoutes);       // User management (Admin only)

/**
 * Root Route - Basic API Health Check
 */
app.get('/', (req, res) => {
    res.json({ message: "Welcome to the Lecture Schedule API" });
});

/**
 * Start the Express Server
 */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

