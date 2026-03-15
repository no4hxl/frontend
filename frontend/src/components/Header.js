import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import './Header.css';

/**
 * Header Component
 * 
 * Displays the Faculty Of Science Lecture Schedule title and 
 * navigation links. Includes a mobile menu toggle for responsiveness.
 */
const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="main-header">
            <div className="container header-content">
                <div className="logo">
                    <Link to="/" onClick={closeMobileMenu}>
                        <h1>Faculty Of Science Lecture <span>Schedule</span></h1>
                    </Link>
                </div>

                {/* Desktop and Mobile Navigation */}
                <nav className={`nav-links ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
                    <Link to="/login#admin" onClick={closeMobileMenu}>Administrator</Link>
                </nav>

                {/* Mobile Toggle Icon */}
                <div className="mobile-toggle" onClick={toggleMobileMenu}>
                    {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                </div>
            </div>
        </header>
    );
};

export default Header;
