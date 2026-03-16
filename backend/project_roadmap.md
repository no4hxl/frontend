# Lecture Schedule App — Full Project Roadmap

> [!NOTE]
> Each item is a discrete, actionable task. We've completed most of these. The current status reflects the hardening and polish phases.

---

## Phase 1: Frontend Hardening (COMPLETED)
*Goal: Make the existing frontend behave like a real application.*

### 1.1 Authentication Context & Route Protection
- [x] **Create `AuthContext`** — React Context for global auth state.
- [x] **Wire up the Login page** — Integrated with backend API and local storage.
- [x] **Create a [ProtectedRoute](file:///c:/Users/nurud/Desktop/lecture_schedule_app/frontend/src/components/ProtectedRoute.js) component** — Case-insensitive role comparison.
- [x] **Apply [ProtectedRoute](file:///c:/Users/nurud/Desktop/lecture_schedule_app/frontend/src/components/ProtectedRoute.js) to Dashboards**.
- [x] **Logout functionality**.
- [x] **Display logged-in user info**.

### 1.2 Admin Dashboard Improvements
- [x] **Course management tab** — FULL CRUD (Create, Read, Update, Delete).
- [x] **Edit/Update functionality** — Inline editing for all items.
- [x] **Replace window methods** with `react-toastify`.

### 1.3 Lecturer Dashboard Improvements
- [x] **Filter "My Schedule"** by logged-in lecturer.
- [x] **Cancel class feature**.
- [x] **Toast Notifications**.

---

## Phase 2: Backend Development (COMPLETED)
*Goal: Build a real API server with data persistence.*

### 2.1 Project Setup
- [x] **Express.js API** initialized.
- [x] **Core dependencies** (`cors`, `dotenv`, `bcryptjs`, `jsonwebtoken`) installed.
- [x] **Environment config** properly managed.

### 2.2 Database Design & Setup
- [x] **SQLite/PostgreSQL Support** via Sequelize.
- [x] **Database schema** designed and implemented (Users, Depts, Venues, Courses, Schedules).
- [x] **Migrations and seed files** created.

### 2.3 API Endpoints
- [x] **Auth routes** — JWT based login/registration.
- [x] **Auth middleware** — JWT verification and role extraction.
- [x] **CRUD routes** for all primary entities.
- [x] **Conflict detection** on the server.

### 2.4 Connect Frontend to Backend
- [x] **API service layer** ([services/api.js](file:///c:/Users/nurud/Desktop/lecture_schedule_app/frontend/src/services/api.js)).
- [x] **Integrated data fetching** in all pages.
- [x] **Redirection Logic** fixed and hardened.

---

## Phase 3: Production Readiness (IN PROGRESS)
*Goal: Make the app robust, tested, and deployable.*

### 3.1 Validation & Security
- [x] **Role-based access control** on both frontend and backend.
- [x] **Password hashing** with bcrypt.
- [ ] **Server-side input validation enhancement** (e.g., `express-validator`).

### 3.2 Testing
- [ ] **Frontend unit tests**.
- [ ] **Backend unit tests**.
- [ ] **Integration tests**.

### 3.3 UX Polish (CURRENT FOCUS)
- [x] **Background "Silent" Refreshes** — Smooth updates without loading flickers.
- [x] **Accessibility audit** — Improved semantic HTML and ARIA labels.
- [ ] **Responsive design audit** (mobile-first verification).
- [ ] **Micro-animations** for better engagement.

### 3.4 Deployment
- [ ] **Frontend deployment** (Vercel/Netlify).
- [ ] **Backend deployment**.
- [ ] **Database hosting**.
- [ ] **Production monitoring setup**.
