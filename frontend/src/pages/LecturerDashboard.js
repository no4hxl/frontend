import React, { useState } from 'react';
import { departments, levels, courses, venues, scheduleData } from '../data/mockData';
import './LecturerDashboard.css';

/**
 * LecturerDashboard Component
 * 
 * Purpose: Allows lecturers to view their schedule, set new classes, and check venue availability.
 * Features:
 * - Tabbed navigation (My Schedule, Set a Class, Check Venue).
 * - Conflict detection to prevent double-booking venues.
 * - View filtered schedule by venue.
 */
const LecturerDashboard = () => {
    const [activeTab, setActiveTab] = useState('my_schedule');

    // Local state to hold the schedule, initialized with mock data
    const [schedule, setSchedule] = useState(scheduleData);

    // State for "Set a Class" form
    const [newClass, setNewClass] = useState({
        department: '',
        level: '',
        courseCode: '',
        day: '',
        time: '',
        venue: '',
        lecturer: 'Dr. Adebayo' // default lecturer for now, or could come from login context
    });

    // State for "Check Venue" selection
    const [selectedVenue, setSelectedVenue] = useState('');

    // Fixed options for Days and Time Slots to make matching easier
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const timeSlots = ["08:00 - 10:00", "10:00 - 12:00", "12:00 - 14:00", "14:00 - 16:00", "16:00 - 18:00"];

    /**
     * Handle form input changes for setting a class
     */
    const handleInputChange = (e) => {
        setNewClass({
            ...newClass,
            [e.target.name]: e.target.value
        });
    };

    /**
     * Submit handler for setting a new class
     * Includes CONFLICT VALIDATION
     */
    const handleSetClass = (e) => {
        e.preventDefault();

        // 1. Basic Validation
        if (!newClass.department || !newClass.level || !newClass.courseCode || !newClass.day || !newClass.time || !newClass.venue) {
            alert("Please fill in all fields.");
            return;
        }

        // 2. Conflict Detection
        // Check if ANY class in the current schedule has the SAME Day, SAME Time, and SAME Venue
        const hasConflict = schedule.some((item) => {
            return (
                item.day === newClass.day &&
                item.time === newClass.time &&
                item.venue === newClass.venue
            );
        });

        if (hasConflict) {
            alert(`CONFLICT ERROR: ${newClass.venue} is already booked on ${newClass.day} at ${newClass.time}. Please choose another time or venue.`);
            return;
        }

        // 3. Add to Schedule
        const classToAdd = {
            id: Date.now(),
            ...newClass
        };

        setSchedule([...schedule, classToAdd]);
        alert("Class scheduled successfully!");

        // Reset form (keeping lecturer same for convenience)
        setNewClass({
            department: '',
            level: '',
            courseCode: '',
            day: '',
            time: '',
            venue: '',
            lecturer: newClass.lecturer
        });
    };

    /**
     * Renders the "My Schedule" tab content
     */
    const renderMySchedule = () => {
        // For simplicity, we show ALL items or filter by a hardcoded "current user"
        // Since we don't have real auth user details, we'll filter by "Dr. Adebayo" or just show all for demo
        // Let's show everything so the user sees data immediately
        const myClasses = schedule;

        return (
            <div className="tab-section">
                <h3>My Upcoming Classes</h3>
                <table className="schedule-table">
                    <thead>
                        <tr>
                            <th>Day</th>
                            <th>Time</th>
                            <th>Course</th>
                            <th>Venue</th>
                            <th>Class</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myClasses.map((item) => (
                            <tr key={item.id}>
                                <td>{item.day}</td>
                                <td>{item.time}</td>
                                <td>{item.courseCode}</td>
                                <td>{item.venue}</td>
                                <td>{item.department} {item.level}L</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    /**
     * Renders the "Set a Class" form
     */
    const renderSetClass = () => {
        return (
            <div className="tab-section">
                <h3>Set a New Class</h3>
                <p className="hint-text">Schedule a lecture or exam. The system will prevent double booking.</p>

                <form className="set-class-form" onSubmit={handleSetClass}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Department</label>
                            <select name="department" value={newClass.department} onChange={handleInputChange}>
                                <option value="">Select Department</option>
                                {departments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Level</label>
                            <select name="level" value={newClass.level} onChange={handleInputChange}>
                                <option value="">Select Level</option>
                                {levels.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Course</label>
                            <select name="courseCode" value={newClass.courseCode} onChange={handleInputChange}>
                                <option value="">Select Course</option>
                                {courses.map(c => <option key={c.code} value={c.code}>{c.code} - {c.title}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Lecturer</label>
                            <input type="text" name="lecturer" value={newClass.lecturer} disabled className="disabled-input" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Day</label>
                            <select name="day" value={newClass.day} onChange={handleInputChange}>
                                <option value="">Select Day</option>
                                {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Time Slot</label>
                            <select name="time" value={newClass.time} onChange={handleInputChange}>
                                <option value="">Select Time</option>
                                {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Venue</label>
                        <select name="venue" value={newClass.venue} onChange={handleInputChange}>
                            <option value="">Select Venue</option>
                            {venues.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                        </select>
                    </div>

                    <button type="submit" className="submit-btn">Schedule Class</button>
                </form>
            </div>
        );
    };

    /**
     * Renders the "Check Venue" tab
     */
    const renderCheckVenue = () => {
        // Filter bookings for the selected venue
        const venueBookings = schedule.filter(item => item.venue === selectedVenue);

        return (
            <div className="tab-section">
                <h3>Check Venue Availability</h3>
                <p className="hint-text">Select a venue to see all its scheduled classes.</p>

                <div className="venue-selector">
                    <label>Select Venue:</label>
                    <select value={selectedVenue} onChange={(e) => setSelectedVenue(e.target.value)}>
                        <option value="">-- Choose a Room --</option>
                        {venues.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                    </select>
                </div>

                {selectedVenue && (
                    <div className="venue-schedule">
                        <h4>Schedule for {selectedVenue}</h4>
                        {venueBookings.length > 0 ? (
                            <table className="schedule-table">
                                <thead>
                                    <tr>
                                        <th>Day</th>
                                        <th>Time</th>
                                        <th>Course</th>
                                        <th>Lecturer</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {venueBookings.map(item => (
                                        <tr key={item.id}>
                                            <td>{item.day}</td>
                                            <td>{item.time}</td>
                                            <td>{item.courseCode}</td>
                                            <td>{item.lecturer}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="empty-state">
                                <p>No classes scheduled in this venue yet. It is completely free.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="lecturer-dashboard">
            <h2>Lecturer Portal</h2>

            <div className="dashboard-nav">
                <button
                    className={activeTab === 'my_schedule' ? 'active' : ''}
                    onClick={() => setActiveTab('my_schedule')}
                >
                    My Schedule
                </button>
                <button
                    className={activeTab === 'set_class' ? 'active' : ''}
                    onClick={() => setActiveTab('set_class')}
                >
                    Set a Class
                </button>
                <button
                    className={activeTab === 'check_venue' ? 'active' : ''}
                    onClick={() => setActiveTab('check_venue')}
                >
                    Check Venue
                </button>
            </div>

            <div className="dashboard-body">
                {activeTab === 'my_schedule' && renderMySchedule()}
                {activeTab === 'set_class' && renderSetClass()}
                {activeTab === 'check_venue' && renderCheckVenue()}
            </div>
        </div>
    );
};

export default LecturerDashboard;
