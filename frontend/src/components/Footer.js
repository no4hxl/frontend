import React from 'react';
import './Footer.css';

/**
 * Footer Component
 * 
 * Centered minimalist footer for the Faculty Of Science Lecture 
 * Scheduling System.
 */
const Footer = () => {
    return (
        <footer className="main-footer">
            <div className="container footer-content">
                <div className="footer-info">
                    <p>&copy; 2026 Faculty Of Science Lecture Scheduling System</p>
                    <small>Automated · Conflict-Free · Efficient</small>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
