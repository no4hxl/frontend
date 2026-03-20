const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

let sequelize;

if (process.env.DATABASE_URL) {
    // Production / Cloud PostgreSQL
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        protocol: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false
    });
} else {
    // Development Fallback: SQLite
    const isTest = process.env.NODE_ENV === 'test';
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: isTest ? ':memory:' : path.join(__dirname, '../database.sqlite'),
        logging: false
    });
}

module.exports = sequelize;
