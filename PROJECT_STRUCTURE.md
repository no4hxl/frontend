# Lecture Schedule App - Project Structure

This document outlines the architecture, directory organization, and data flow of the Lecture Schedule App.

## 🏗️ Architecture Overview

The application follows a standard **Client-Server** architecture:

- **Frontend**: A modern React Single Page Application (SPA).
- **Backend**: A Node.js/Express REST API.
- **Database**: SQLite (managed via Sequelize ORM).
- **Authentication**: Stateless JSON Web Tokens (JWT) with Role-Based Access Control (RBAC).

---

## 📁 Directory Structure

### 🌐 Frontend (`/frontend`)
The frontend is built with React and organized into functional directories:

- `src/context/`: **AuthContext.js** manages the global authentication state (user data, login/logout).
- `src/services//`: **api.js** contains Axios instances with interceptors to handle JWT injection and centralized the API calls.
- `src/pages/`: Main application views:
    - `Home.js`: Landing page with public timetable view.
    - `Login.js`: Entry point for Admins and Lecturers.
    - `AdminDashboard.js`: Resource management portal.
    - `LecturerDashboard.js`: Class scheduling and personal timetable management.
- `src/components/`: Reusable UI elements:
    - `admin/`: Specialized components like `UserList`, `AddItemForm`, and `TabBar`.
    - `shared/`: Generic components (Header, Footer, ProtectedRoute).
- `src/styles/`: Vanilla CSS files for styling (NEON gradient theme).

### ⚙️ Backend (`/backend`)
The backend is structured for scalability and follows the MVC (Model-View-Controller) pattern:

- `models/`: Database schemas defined using Sequelize.
    - `User.js`, `Course.js`, `Schedule.js`, `StaticData.js`.
- `controllers/`: Business logic for each domain.
    - `authController.js`: Login and token generation.
    - `scheduleController.js`: TIMETABLE management with **Conflict Detection**.
    - `userController.js`: User CRUD operations.
- `middleware/`: Request filters.
    - `authMiddleware.js`: Protects routes and verifies roles.
- `routes/`: API endpoint definitions.
    - `dataRoutes.js`: Dynamic CRUD for organizational data.
    - `userRoutes.js`: Protected admin routes.
- `server.js`: Entry point that bootstraps Express and synchronizes the database.

---

## 🔄 Core Data Flows

### 1. Authentication Flow
1. User submits credentials in the **Login Page**.
2. **AuthContext** calls `authAPI.login()`.
3. Backend verifies credentials and returns a **JWT token**.
4. **AuthContext** saves the token in `localStorage` and updates the global `user` state.
5. All subsequent requests are automatically signed via **Axios Interceptors**.

### 2. Timetable Conflict Detection
When a lecturer schedules a class:
1. The frontend sends Level, Dept, Course, Venue, Day, and Time to `/api/schedules`.
2. The **scheduleController** queries for overlapping entries:
    - Does this level have a class at this time?
    - Does this venue have a class at this time?
3. If no overlaps exist, the record is created. Otherwise, a `400 Bad Request` with a descriptive error message is returned.

### 3. Silent UI Refresh
To maintain a smooth UX, the Dashboards use a **Silent Refresh** pattern:
- After a successful POST/PUT/DELETE operation, the frontend triggers a background `fetch()` without showing a global loading spinner.
- This ensures the UI is always in sync with the server without disrupting the user's scroll position or view state.

---

## 🛠️ Tech Stack
- **Frontend**: React, React-Router-DOM, React-Toastify, Axios.
- **Backend**: Node.js, Express, Sequelize ORM.
- **Database**: SQLite3.
- **Security**: Bcrypt (hashing), JWT (session).
