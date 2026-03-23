/**
 * @file App.js
 * @description Root component of the Lecture Schedule Application (Frontend).
 * Manages global providers, main routing structure, and page-level transitions.
 */

import { AnimatePresence, motion } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import StudentSchedule from './pages/StudentSchedule';
import AdminDashboard from './pages/AdminDashboard';
import LecturerDashboard from './pages/LecturerDashboard';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

/**
 * @component PageWrapper
 * @description Orchestrates enter/exit animations for top-level routes.
 * Uses Framer Motion's AnimatePresence to detect URL changes and trigger transitions.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The specific page component to render.
 */
const PageWrapper = ({ children }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * @function App
 * @description Main Application entry point.
 * Wraps the application in AuthProvider for state management and Router for navigation.
 */
function App() {
  return (
    <AuthProvider>
      {/* Toast notifications for feedback (Errors, Success messages) */}
      <ToastContainer position="bottom-right" theme="dark" />
      
      <Router>
        <div className="App">
          {/* Navigation Bar */}
          <Header />
          
          {/* Content Area with dynamic routing */}
          <main style={{ minHeight: '80vh', padding: '20px' }}>
            <PageWrapper>
              <Routes>
                {/* --- PUBLIC ACCESSIBLE ROUTES --- */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/student" element={<StudentSchedule />} />

                {/* --- PROTECTED ADMINISTRATIVE ROUTES --- */}
                {/* requireRole="admin" ensures only users with admin role can enter */}
                <Route 
                  path="/admin-dashboard" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* --- PROTECTED LECTURER ROUTES --- */}
                {/* requireRole="lecturer" restricts access to verified faculty only */}
                <Route 
                  path="/lecturer-dashboard" 
                  element={
                    <ProtectedRoute requiredRole="lecturer">
                      <LecturerDashboard />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </PageWrapper>
          </main>
          
          {/* Global Site Footer */}
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

