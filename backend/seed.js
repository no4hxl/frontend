const bcrypt = require('bcryptjs');
const { User, Course, Department, Venue, Level, Schedule } = require('./models/index');
const sequelize = require('./config/database');

/**
 * seed.js
 * Utility script to populate the database with initial development data.
 * Drops existing tables and recreates them with default departments, users, and schedules.
 */

const seed = async () => {
    try {
        console.log("--- Starting Seeding ---");
        
        // Synchronize models: { force: true } drops tables if they already exist
        await sequelize.sync({ force: true }); 
        
        // Define default password for all seeded users
        const hashedPassword = await bcrypt.hash('password123', 10);

        /**
         * 1. Seed Departments
         * Functional divisions within the Faculty.
         */
        const deptNames = ["Computer Science", "Mathematics", "Physics", "Chemistry", "Biology", "Statistics"];
        const depts = [];
        for (const name of deptNames) {
            const d = await Department.create({ name });
            depts.push(d);
        }
        console.log("✅ Seeded Departments");

        /**
         * 2. Seed Levels
         * Academic years (100 to 400).
         */
        const levelNames = ["100", "200", "300", "400"];
        const levels = [];
        for (const name of levelNames) {
            const l = await Level.create({ name });
            levels.push(l);
        }
        console.log("✅ Seeded Levels");

        /**
         * 3. Seed Venues
         * Physical locations where lectures take place.
         */
        const venueNames = ["Lecture Theater A", "Lecture Theater B", "Science Hall 1", "Computer Lab 1", "Room 101"];
        const venues = [];
        for (const name of venueNames) {
            const v = await Venue.create({ name });
            venues.push(v);
        }
        console.log("✅ Seeded Venues");

        /**
         * 4. Seed Users (Admin + Lecturers)
         * Creates one system admin and several lecturer accounts.
         */
        const admin = await User.create({
            name: "Main Admin",
            email: "admin@uniabuja.edu.ng",
            password: hashedPassword,
            role: "admin"
        });

        const lecturerData = [
            { name: "Dr. Adebayo", email: "adebayo@uniabuja.edu.ng" },
            { name: "Prof. Smith", email: "smith@uniabuja.edu.ng" },
            { name: "Dr. Johnson", email: "johnson@uniabuja.edu.ng" },
            { name: "Mr. Okonkwo", email: "okonkwo@uniabuja.edu.ng" },
            { name: "Mrs. Danjuma", email: "danjuma@uniabuja.edu.ng" }
        ];

        const lecturers = [];
        for (const l of lecturerData) {
            const user = await User.create({
                name: l.name,
                email: l.email,
                password: hashedPassword,
                role: "lecturer"
            });
            lecturers.push(user);
        }
        console.log("✅ Seeded Users (Admin + 5 Lecturers)");

        /**
         * 5. Seed Courses
         * Academic courses linked to specific departments.
         */
        const courseData = [
            { code: "CSC101", title: "Introduction to Computer Science", deptName: "Computer Science" },
            { code: "MTH101", title: "General Mathematics I", deptName: "Mathematics" },
            { code: "PHY101", title: "General Physics I", deptName: "Physics" },
            { code: "CHM101", title: "General Chemistry I", deptName: "Chemistry" },
            { code: "CSC201", title: "Data Structures & Algorithms", deptName: "Computer Science" },
            { code: "CSC202", title: "Object Oriented Programming", deptName: "Computer Science" },
            { code: "MTH201", title: "Mathematical Methods", deptName: "Mathematics" },
            { code: "CSC301", title: "Operating Systems", deptName: "Computer Science" },
            { code: "CSC302", title: "Database Management Systems", deptName: "Computer Science" },
            { code: "CSC401", title: "Artificial Intelligence", deptName: "Computer Science" },
            { code: "CSC402", title: "Software Engineering", deptName: "Computer Science" },
        ];

        for (const c of courseData) {
            const dept = depts.find(d => d.name === c.deptName);
            await Course.create({
                code: c.code,
                title: c.title,
                DepartmentId: dept.id
            });
        }
        console.log("✅ Seeded Courses");

        /**
         * 6. Seed Schedule
         * Creates initial lecture timetable entries with all associations.
         */
        const scheduleEntries = [
            { dept: "Computer Science", level: "100", courseCode: "CSC101", day: "Monday", time: "08:00 - 10:00", venue: "Lecture Theater A", lecturer: "Dr. Adebayo" },
            { dept: "Computer Science", level: "100", courseCode: "MTH101", day: "Tuesday", time: "10:00 - 12:00", venue: "Lecture Theater B", lecturer: "Prof. Smith" },
            { dept: "Computer Science", level: "100", courseCode: "PHY101", day: "Wednesday", time: "14:00 - 16:00", venue: "Science Hall 1", lecturer: "Dr. Johnson" },
            { dept: "Computer Science", level: "200", courseCode: "CSC201", day: "Monday", time: "10:00 - 12:00", venue: "Computer Lab 1", lecturer: "Mr. Okonkwo" },
            { dept: "Computer Science", level: "200", courseCode: "CSC202", day: "Thursday", time: "08:00 - 10:00", venue: "Computer Lab 1", lecturer: "Mrs. Danjuma" },
            { dept: "Computer Science", level: "200", courseCode: "MTH201", day: "Friday", time: "08:00 - 10:00", venue: "Room 101", lecturer: "Prof. Smith" },
            { dept: "Computer Science", level: "300", courseCode: "CSC301", day: "Tuesday", time: "12:00 - 14:00", venue: "Lecture Theater A", lecturer: "Dr. Adebayo" },
            { dept: "Computer Science", level: "300", courseCode: "CSC302", day: "Wednesday", time: "08:00 - 10:00", venue: "Computer Lab 1", lecturer: "Mrs. Danjuma" },
            { dept: "Computer Science", level: "400", courseCode: "CSC401", day: "Monday", time: "14:00 - 16:00", venue: "Computer Lab 1", lecturer: "Dr. Johnson" },
            { dept: "Computer Science", level: "400", courseCode: "CSC402", day: "Friday", time: "10:00 - 12:00", venue: "Lecture Theater B", lecturer: "Mr. Okonkwo" },
        ];

        for (const s of scheduleEntries) {
            const dept = depts.find(d => d.name === s.dept);
            const level = levels.find(l => l.name === s.level);
            const venue = venues.find(v => v.name === s.venue);
            const lecturer = lecturers.find(l => l.name === s.lecturer);
            
            await Schedule.create({
                day: s.day,
                timeSlot: s.time,
                DepartmentId: dept.id,
                LevelId: level.id,
                VenueId: venue.id,
                CourseCode: s.courseCode,
                lecturerId: lecturer.id
            });
        }
        console.log("✅ Seeded Schedule Entries");

        console.log("\n--- Seeding Completed Successfully ---");
        process.exit(0);
    } catch (error) {
        console.error("\n❌ Seeding Failed:", error);
        process.exit(1);
    }
};

// Execute seeding
seed();

