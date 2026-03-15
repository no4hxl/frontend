import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Login.css';

/**
 * Login Page Component
 * 
 * Provides a minimalist, role-based entry point for Lecturers and Admins.
 * Features a dynamic switch to toggle between the two roles.
 */
const Login = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Determine initial role based on URL hash or default to 'lecturer'
    const [role, setRole] = useState('lecturer');

    useEffect(() => {
        const hash = location.hash.replace('#', '');
        if (hash === 'admin' || hash === 'lecturer') {
            setRole(hash);
        }
    }, [location.hash]);

    const handleRoleChange = (newRole) => {
        setRole(newRole);
        // Update hash without full navigation
        window.history.replaceState(null, '', `#${newRole}`);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(`Logging in as ${role}...`);
        // Authentication logic would go here

        if (role === 'admin') {
            navigate('/admin-dashboard');
        } else {
            navigate('/lecturer-dashboard');
        }
    };

    return (
        <div className="login-page">
            <div className="container">
                <div className="login-card">
                    <div className="login-header">
                        <h2>{role === 'admin' ? 'Admin Portal' : 'Lecturer Portal'}</h2>
                        <p>Faculty Of Science Lecture Schedule</p>
                    </div>

                    {/* Role Switcher Toggle */}
                    <div className="role-switcher">
                        <button
                            className={`switch-btn ${role === 'lecturer' ? 'active' : ''}`}
                            onClick={() => handleRoleChange('lecturer')}
                        >
                            Lecturer
                        </button>
                        <button
                            className={`switch-btn ${role === 'admin' ? 'active' : ''}`}
                            onClick={() => handleRoleChange('admin')}
                        >
                            Admin
                        </button>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" placeholder="Enter your Email Address" required />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input type="password" placeholder="Enter your Password" required />
                        </div>
                        <button type="submit" className="login-submit-btn">
                            Sign In to {role.charAt(0).toUpperCase() + role.slice(1)} Portal
                        </button>
                    </form>

                    <div className="login-footer">
                        <button className="back-btn" onClick={() => navigate('/')}>
                            &larr; Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
