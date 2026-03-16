export const departments = [
    { id: 1, name: "Computer Science" },
    { id: 2, name: "Mathematics" },
    { id: 3, name: "Physics" },
    { id: 4, name: "Chemistry" },
    { id: 5, name: "Biology" },
    { id: 6, name: "Statistics" }
];

export const levels = [
    { id: 1, name: "100" },
    { id: 2, name: "200" },
    { id: 3, name: "300" },
    { id: 4, name: "400" }
];

export const courses = [
    { code: "CSC101", title: "Introduction to Computer Science" },
    { code: "MTH101", title: "General Mathematics I" },
    { code: "PHY101", title: "General Physics I" },
    { code: "CHM101", title: "General Chemistry I" },
    { code: "CSC201", title: "Data Structures & Algorithms" },
    { code: "CSC202", title: "Object Oriented Programming" },
    { code: "MTH201", title: "Mathematical Methods" },
    { code: "CSC301", title: "Operating Systems" },
    { code: "CSC302", title: "Database Management Systems" },
    { code: "CSC401", title: "Artificial Intelligence" },
    { code: "CSC402", title: "Software Engineering" },
];

export const lecturers = [
    { id: 1, name: "Dr. Adebayo" },
    { id: 2, name: "Prof. Smith" },
    { id: 3, name: "Dr. Johnson" },
    { id: 4, name: "Mr. Okonkwo" },
    { id: 5, name: "Mrs. Danjuma" }
];

export const venues = [
    { id: 1, name: "Lecture Theater A" },
    { id: 2, name: "Lecture Theater B" },
    { id: 3, name: "Science Hall 1" },
    { id: 4, name: "Computer Lab 1" },
    { id: 5, name: "Room 101" }
];

// The main schedule database
// This simulates fetching data from a backend
export const scheduleData = [
    // 100 Level Computer Science
    { id: 1, department: "Computer Science", level: "100", courseCode: "CSC101", day: "Monday", time: "08:00 - 10:00", venue: "Lecture Theater A", lecturer: "Dr. Adebayo" },
    { id: 2, department: "Computer Science", level: "100", courseCode: "MTH101", day: "Tuesday", time: "10:00 - 12:00", venue: "Lecture Theater B", lecturer: "Prof. Smith" },
    { id: 3, department: "Computer Science", level: "100", courseCode: "PHY101", day: "Wednesday", time: "14:00 - 16:00", venue: "Science Hall 1", lecturer: "Dr. Johnson" },

    // 200 Level Computer Science
    { id: 4, department: "Computer Science", level: "200", courseCode: "CSC201", day: "Monday", time: "10:00 - 12:00", venue: "Computer Lab 1", lecturer: "Mr. Okonkwo" },
    { id: 5, department: "Computer Science", level: "200", courseCode: "CSC202", day: "Thursday", time: "08:00 - 10:00", venue: "Computer Lab 1", lecturer: "Mrs. Danjuma" },
    { id: 6, department: "Computer Science", level: "200", courseCode: "MTH201", day: "Friday", time: "08:00 - 10:00", venue: "Room 101", lecturer: "Prof. Smith" },

    // 300 Level Computer Science
    { id: 7, department: "Computer Science", level: "300", courseCode: "CSC301", day: "Tuesday", time: "12:00 - 14:00", venue: "Lecture Theater A", lecturer: "Dr. Adebayo" },
    { id: 8, department: "Computer Science", level: "300", courseCode: "CSC302", day: "Wednesday", time: "08:00 - 10:00", venue: "Computer Lab 1", lecturer: "Mrs. Danjuma" },

    // 400 Level Computer Science
    { id: 9, department: "Computer Science", level: "400", courseCode: "CSC401", day: "Monday", time: "14:00 - 16:00", venue: "Computer Lab 1", lecturer: "Dr. Johnson" },
    { id: 10, department: "Computer Science", level: "400", courseCode: "CSC402", day: "Friday", time: "10:00 - 12:00", venue: "Lecture Theater B", lecturer: "Mr. Okonkwo" },

    // Physics Example
    { id: 11, department: "Physics", level: "100", courseCode: "PHY101", day: "Monday", time: "10:00 - 12:00", venue: "Science Hall 1", lecturer: "Dr. Johnson" },
    { id: 12, department: "Physics", level: "200", courseCode: "MTH201", day: "Wednesday", time: "10:00 - 12:00", venue: "Room 101", lecturer: "Prof. Smith" },
];
