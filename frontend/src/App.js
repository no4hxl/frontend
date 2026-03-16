import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
 * Main App Component
 * 
 * Sets up the routing architecture and global state providers.
 */
function App() {
  return (
    <AuthProvider>
      <ToastContainer position="bottom-right" theme="dark" />
      <Router>
        <div className="App">
          <Header />
          <main style={{ minHeight: '80vh', padding: '20px' }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/student" element={<StudentSchedule />} />

              {/* Protected Admin Routes */}
              <Route 
                path="/admin-dashboard" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Protected Lecturer Routes */}
              <Route 
                path="/lecturer-dashboard" 
                element={
                  <ProtectedRoute requiredRole="lecturer">
                    <LecturerDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
