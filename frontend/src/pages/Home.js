import { useNavigate } from 'react-router-dom';
import './Home.css';

/**
 * Home Page Component
 * 
 * Features a minimalist Hero section and highlights the core 
 * value propositions of the Faculty Of Science Lecture Schedule system.
 */
const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="container">
                    <div className="hero-content">
                        <h1>Faculty Of Science Lecture <span>Schedule</span></h1>
                        <p>
                            A centralized web-based platform for lecture and examination scheduling.
                        </p>
                        <div className="hero-actions">
                            <button className="btn btn-primary" onClick={() => navigate('/student')}>
                                View Schedule
                            </button>
                            <button className="btn btn-secondary" onClick={() => navigate('/login')}>
                                Access Portal
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <div className="features-grid">
                        <div className="feature-card">
                            <h3>Clash-Free Scheduling</h3>
                            <p>Prevents lecture time conflicts across departments, ensuring no two classes overlap for students or venues.</p>
                        </div>
                        <div className="feature-card">
                            <h3>Conflict-Free</h3>
                            <p>Ensures no overlaps between lectures and examinations for students and staff.</p>
                        </div>
                        <div className="feature-card">
                            <h3>Role-Based Access</h3>
                            <p>Dedicated portals for Admin, Faculty, Lecturers, and Students.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
