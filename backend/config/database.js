/**
 * @file database.js
 * @description Centralized Database Access Layer (DAL) Configuration.
 * Orchestrates connection management via Sequelize ORM with environment-aware failover.
 * 
 * Capability:
 * - Production: Connects to managed PostgreSQL via 'DATABASE_URL'.
 * - Development: Utilizes local SQLite file persistence.
 * - Testing: Leverages In-memory SQLite for ephemeral isolated tests.
 */

const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

/**
 * @instance sequelize
 * @description Configured Sequelize singleton used across the backend for data operations.
 */
let sequelize;

if (process.env.DATABASE_URL) {
    /** 
     * PRODUCTION CONFIGURATION (PostgreSQL)
     * Optimized for cloud environments like Heroku/Render/AWS.
     */
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        protocol: 'postgres',
        dialectOptions: {
            // SSL required for most cloud providers (e.g., Heroku Postgres)
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false // Suppress SQL logs in production for performance and security
    });
} else {
    /** 
     * DEVELOPMENT / CI CONFIGURATION (SQLite)
     * Provides a zero-dependency local database for rapid iteration.
     */
    const isTest = process.env.NODE_ENV === 'test';
    
    sequelize = new Sequelize({
        dialect: 'sqlite',
        // In-memory mode enabled for 'test' env to ensure clean state per run
        storage: isTest ? ':memory:' : path.join(__dirname, '../database.sqlite'),
        logging: false
    });
    
    console.log(`[Database] Local ${isTest ? 'TEST/IN-MEMORY' : 'Persisted'} SQLite instance initialized.`);
}

module.exports = sequelize;

