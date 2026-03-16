import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

/**
 * Header Component
 * 
 * Displays the University logo/title and provides authentication-related actions.
 * Shows user status and provide logout when authenticated.
 */
const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    /**
     * Handles logout action
     */
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="main-header">
            <div className="container header-content">
                <div className="logo">
                    <Link to="/">
                        <h1>University Of <span>Abuja</span></h1>
                    </Link>
                </div>

                {/* Authentication Menu */}
                <div className="auth-menu">
                    {user.isAuthenticated && (
                        <div className="user-info">
                            <span className="welcome-text">
                                Welcome, <strong>{user.name}</strong> 
                                <span className="role-tag">{user.role}</span>
                            </span>
                            <button className="logout-btn" onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
