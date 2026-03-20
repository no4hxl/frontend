const request = require('supertest');
const app = require('../server');
const { initDB, User, Schedule, Department, Venue, Level, Course } = require('../models/index');

/**
 * api.test.js
 * Integration tests for core API features:
 * - Authentication (Login/Validation)
 * - Flexible Scheduling (Range-based conflict detection)
 */

describe('Core API Integration Tests', () => {
    let adminToken;
    let lecturerId;
    let deptId, venueId, levelId;

    // Seed minimal data for testing before running tests
    beforeAll(async () => {
        // Ensure DB is ready and wiped
        await initDB();
        
        // Create a test department, venue, and level
        const dept = await Department.create({ name: 'Test Science' });
        const venue = await Venue.create({ name: 'Lab 101' });
        const level = await Level.create({ name: '100' });
        
        deptId = dept.id;
        venueId = venue.id;
        levelId = level.id;

        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        // Create a test user directly
        const user = await User.create({
            name: 'Test Admin',
            email: 'admin@test.com',
            password: hashedPassword,
            role: 'admin'
        });
        
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@test.com',
                password: 'password123'
            });
        
        adminToken = loginRes.body.token;
        lecturerId = user.id;

        // Create a course
        const course = await Course.create({
            code: 'TEST101',
            title: 'Test Course',
            DepartmentId: deptId
        });
    });

    describe('Validation Tests', () => {
        it('should return 400 for invalid email on login', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'invalid-email',
                    password: '123'
                });
            expect(res.status).toBe(400);
            expect(res.body.message).toBeDefined();
        });
    });

    describe('Flexible Scheduling Conflict Tests', () => {
        it('should successfully book a class when no conflict exists', async () => {
            const res = await request(app)
                .post('/api/schedules')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    departmentId: deptId,
                    levelId: levelId,
                    courseCode: 'TEST101',
                    day: 'Monday',
                    startTime: '08:00',
                    endTime: '10:00',
                    venueId: venueId,
                    lecturerId: lecturerId
                });
            expect(res.status).toBe(201);
        });

        it('should block a class that overlaps with an existing one', async () => {
            // Existing is 08:00 - 10:00
            // Trying to book 09:00 - 11:00 (Overlap)
            const res = await request(app)
                .post('/api/schedules')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    departmentId: deptId,
                    levelId: levelId,
                    courseCode: 'TEST101',
                    day: 'Monday',
                    startTime: '09:00',
                    endTime: '11:00',
                    venueId: venueId,
                    lecturerId: lecturerId
                });
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('conflict');
        });

        it('should block a class that covers an existing one completely', async () => {
            // Existing is 08:00 - 10:00
            // Trying to book 07:00 - 11:00 (Total Overlap)
            const res = await request(app)
                .post('/api/schedules')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    departmentId: deptId,
                    levelId: levelId,
                    courseCode: 'TEST101',
                    day: 'Monday',
                    startTime: '07:00',
                    endTime: '11:00',
                    venueId: venueId,
                    lecturerId: lecturerId
                });
            expect(res.status).toBe(400);
        });
    });
});
