# Faculty of Science Lecture Schedule App (Frontend)

Welcome to the frontend documentation for the **Faculty of Science Lecture Schedule App**. This project is a React-based web application designed to solve the problem of manual scheduling conflicts in universities.

It serves three main types of users:
1.  **Students**: To view their weekly timetables.
2.  **Lecturers**: To schedule classes and check for venue conflicts.
3.  **Administrators**: To manage the system structure (Departments, Venues, etc.).

---

## 📂 Project Structure

Here is a high-level overview of the important files and folders in `src/`.

```
src/
├── components/          # Reusable UI parts (Header, Footer)
├── data/                # Mock database (temporary data storage)
├── pages/               # The main screens of the application
├── App.js               # The main Router configuration
└── index.js             # The entry point of the React app
```

---

## 📖 Page Guide

Here is a detailed breakdown of every page in the application, what it does, and why it exists.

### 1. Home Page
*   **File**: `src/pages/Home.js`
*   **Purpose**: The landing page for the application.
*   **Key Features**:
    *   **"View Schedule" Button**: A direct link for students to check their classes immediately without logging in.
    *   **"Access Portal"**: Redirects staff (Admins/Lecturers) to the login page.
*   **Why?**: We wanted the design to be "Student First"—allowing students to get their information as fast as possible.

### 2. Login Page
*   **File**: `src/pages/Login.js`
*   **Purpose**: A centralized entry point for restricted areas.
*   **Key Features**:
    *   **Role Switcher**: A toggle to switch between "Lecturer" and "Admin" modes.
    *   **Routing Logic**:
        *   If logging in as **Admin** -> Redirects to `/admin-dashboard`.
        *   If logging in as **Lecturer** -> Redirects to `/lecturer-dashboard`.
*   **Why?**: Instead of building separate login screens, a single dynamic page reduces code duplication and simplifies the user experience.

### 3. Student Schedule Page
*   **File**: `src/pages/StudentSchedule.js`
*   **Purpose**: Allows students to filter the massive schedule database to find only their classes.
*   **Key Features**:
    *   **Filtering**: Dropdowns for "Department" and "Level".
    *   **Read-Only View**: Students cannot edit data; they can only view it.
*   **Why?**: Showing the entire faculty schedule at once would be overwhelming. The filter logic makes the data usable.

### 4. Admin Dashboard
*   **File**: `src/pages/AdminDashboard.js`
*   **Purpose**: A control center for the "Super User" to manage the university structure.
*   **Key Features**:
    *   **CRUD System**: Create, Read, Update, Delete functionality.
    *   **Tabs**: Manage "Departments", "Venues", "Levels", and "Lecturers".
*   **Why?**: The system needs a way to grow. As new departments or lecture halls are built, the Admin can add them here so Lecturers can use them.

### 5. Lecturer Dashboard
*   **File**: `src/pages/LecturerDashboard.js`
*   **Purpose**: The daily tool for academic staff.
*   **Key Features**:
    *   **Set a Class (Scheduling)**: A form to book a lecture.
    *   **Conflict Detection**: **[CRITICAL]** The code checks `if (venue is busy at time X)`. If true, it blocks the booking and alerts the lecturer.
    *   **Check Venue**: A visual look at a room's schedule to find free slots.
*   **Why?**: The primary goal of this app is to prevent two classes from clashing in the same hall. This dashboard enforces that rule logic.

---

## 💾 Data Layer (Mock Database)

*   **File**: `src/data/mockData.js`
*   **Purpose**: Since we do not have a real backend server (like Node.js/Python) or database (SQL/MongoDB) yet, this file acts as our "database".
*   **How it works**: It exports arrays of Javascript Objects (`departments`, `scheduleData`, etc.).
*   **Important Note**: When you add data in the app, it is stored in **React State (RAM)**. If you refresh the page, the new data disappears and resets to what is written in this file.

---

## 🛠 Technologies Used

*   **React.js**: For building the user interface.
*   **React Router DOM**: For handling navigation between pages (`/login`, `/student`, etc.).
*   **CSS3**: Custom, minimal styling for a clean aesthetic.

---

## 💡 Tips for Beginner Developers

*   **Code Comments**: Check the source files! We have added detailed comments explaining complex logic, especially in the "Conflict Detection" part of `LecturerDashboard.js`.
*   **Debugging**: If something isn't working, check the Console in your browser's Developer Tools (F12).