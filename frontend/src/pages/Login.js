import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

/**
 * Login Page Component
 * 
 * Provides a minimalist, role-based entry point for Lecturers and Admins.
 * Integrated with AuthContext to manage global session state.
 */
const Login = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, login } = useAuth();

    // Determine initial role based on URL hash or default to 'lecturer'
    const [role, setRole] = useState('lecturer');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    /**
     * Automatic Redirection
     * Once user is authenticated, route them to the appropriate dashboard.
     */
    useEffect(() => {
        if (user && user.isAuthenticated) {
            const origin = location.state?.from?.pathname;
            const normalizedRole = user.role?.toLowerCase() || '';

            // If an intended destination was saved, go there
            if (origin && origin !== '/' && origin !== '/login') {
                navigate(origin, { replace: true });
                return;
            }

            // Otherwise, route based on role
            if (normalizedRole === 'admin') {
                navigate('/admin-dashboard', { replace: true });
            } else if (normalizedRole === 'lecturer') {
                navigate('/lecturer-dashboard', { replace: true });
            } else {
                // Fallback for unexpected roles
                console.warn(`Unrecognized role: ${normalizedRole}. Defaulting to home.`);
                navigate('/', { replace: true });
            }
        }
    }, [user, navigate, location.state]);

    /**
     * Sync hash with internal role selection
     */
    useEffect(() => {
        const hash = location.hash.replace('#', '').toLowerCase();
        if (hash === 'admin' || hash === 'lecturer') {
            setRole(hash);
        }
    }, [location.hash]);

    /**
     * Handles role toggle and updates URL hash
     */
    const handleRoleChange = (newRole) => {
        setRole(newRole);
        window.history.replaceState(null, '', `#${newRole}`);
    };

    /**
     * Authenticates via context and triggers the login process.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        const { toast } = await import('react-toastify');
        
        // Perform "Login" in global context
        const result = await login(email, password);

        if (!result.success) {
            toast.error(result.message);
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
                            type="button"
                            className={`switch-btn ${role === 'lecturer' ? 'active' : ''}`}
                            onClick={() => handleRoleChange('lecturer')}
                        >
                            Lecturer
                        </button>
                        <button
                            type="button"
                            className={`switch-btn ${role === 'admin' ? 'active' : ''}`}
                            onClick={() => handleRoleChange('admin')}
                        >
                            Admin
                        </button>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input 
                                id="email"
                                type="email" 
                                placeholder="Enter your Email Address" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input 
                                id="password"
                                type="password" 
                                placeholder="Enter your Password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                        </div>
                        <button type="submit" className="login-submit-btn">
                            Sign In to {role.charAt(0).toUpperCase() + role.slice(1)} Portal
                        </button>
                    </form>

                    <div className="login-footer">
                        <button type="button" className="back-btn" onClick={() => navigate('/')}>
                            &larr; Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

