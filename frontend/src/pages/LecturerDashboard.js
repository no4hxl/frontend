/**
 * @file LecturerDashboard.js
 * @description Specialized portal for Faculty/Lecturers. 
 * Allows users to manage their teaching schedules, request new class slots, 
 * and perform venue availability checks.
 * 
 * Key Logic:
 * - Local form state management for complex multi-input scheduling.
 * - Integration with backend conflict detection engine.
 * - Reactive filtering of global schedules to user-specific views.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { dataAPI, scheduleAPI } from '../services/api';
import './LecturerDashboard.css';

/**
 * @component LecturerDashboard
 * @description Main dashboard for lecturer-level interactions.
 */
const LecturerDashboard = () => {
    
    /**
     * @context user
     * @description Provides the logged-in lecturer's ID and name for personalized views.
     */
    const { user } = useAuth();
    
    /**
     * @state activeTab
     * @description Orchestrates the current view mode: 'my_schedule', 'set_class', or 'check_venue'.
     */
    const [activeTab, setActiveTab] = useState('my_schedule');
    
    /**
     * @state loading
     * @description Toggles UI loaders during network synchronization.
     */
    const [loading, setLoading] = useState(false);

    /**
     * @state metadata
     * @description Local cache of structural data (Depts, Venues, etc.) required for populating dropdowns.
     */
    const [metadata, setMetadata] = useState({
        departments: [],
        levels: [],
        courses: [],
        venues: []
    });

    /**
     * @state schedule
     * @description Snapshot of the global timetable used for self-view and availability checks.
     */
    const [schedule, setSchedule] = useState([]);

    /**
     * @state newClass
     * @description Controlled form state for the "Schedule New Class" workflow.
     */
    const [newClass, setNewClass] = useState({
        departmentId: '',
        levelId: '',
        courseCode: '',
        day: '',
        startHour: '08',
        startMin: '00',
        endHour: '10',
        endMin: '00',
        venueId: ''
    });

    /**
     * @state selectedVenueId
     * @description Pivot for the "Check Venue" availability matrix.
     */
    const [selectedVenueId, setSelectedVenueId] = useState('');

    /**
     * TIMETABLE CONFIGURATION
     * Standard definitions for school hours and operational days.
     */
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const hours = Array.from({ length: 15 }, (_, i) => (i + 7).toString().padStart(2, '0')); // 07:00 to 21:00 window
    const minutes = ["00", "15", "30", "45"];

    /**
     * @lifecycle useEffect (Initialization)
     * @description Hydrates the dashboard with organizational metadata on component mount.
     */
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                // Execute metadata fetches in parallel for optimal performance
                const [d, v, l, c] = await Promise.all([
                    dataAPI.getDepartments(),
                    dataAPI.getVenues(),
                    dataAPI.getLevels(),
                    dataAPI.getCourses()
                ]);
                setMetadata({
                    departments: d.data,
                    venues: v.data,
                    levels: l.data,
                    courses: c.data
                });
            } catch (error) {
                console.error("[LecturerInit] Metadata failure:", error);
                toast.error("Connectivity issue: Unable to load system resources.");
            }
        };
        fetchMetadata();
    }, []);

    /**
     * @function fetchSchedules
     * @description Pulls latest global timetable entries to ensure the lecturer is viewing real-time data.
     * 
     * @async
     * @param {boolean} isSilent - If true, performs the sync without interrupting the UI flow with loaders.
     */
    const fetchSchedules = async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        
        try {
            const res = await scheduleAPI.getAll();
            setSchedule(res.data);
        } catch (error) {
            console.error("[LecturerSync] Schedule failure:", error);
            toast.error("Failed to synchronize timetable with server.");
        } finally {
            if (!isSilent) setLoading(false);
        }
    };

    /**
     * @lifecycle useEffect (Schedules)
     * @description Performs the initial timetable ingest.
     */
    useEffect(() => {
        fetchSchedules(false);
    }, []);

    /**
     * @handler handleInputChange
     * @description Generalized form input syncer for the scheduling wizard.
     */
    const handleInputChange = (e) => {
        setNewClass({
            ...newClass,
            [e.target.name]: e.target.value
        });
    };

    /**
     * @handler handleSetClass
     * @description Dispatches a new class scheduling request.
     * Validates time logic locally before sending to server-side conflict detection.
     */
    const handleSetClass = async (e) => {
        e.preventDefault();

        // Guard: Comprehensive field check
        const required = ['departmentId', 'levelId', 'courseCode', 'day', 'venueId'];
        if (required.some(field => !newClass[field])) {
            toast.warning("Incomplete application: All fields are mandatory.");
            return;
        }

        const startTime = `${newClass.startHour}:${newClass.startMin}`;
        const endTime = `${newClass.endHour}:${newClass.endMin}`;

        // Guard: Logical time check
        if (startTime >= endTime) {
            toast.error("Clock logic Error: Class end time must exceed start time.");
            return;
        }

        try {
            const payload = {
                ...newClass,
                startTime,
                endTime,
                lecturerId: user.id
            };
            
            await scheduleAPI.create(payload);
            toast.success("Schedule Updated: Your class has been successfully booked.");
            
            // Clean up: Reset form for next entry
            setNewClass({
                departmentId: '',
                levelId: '',
                courseCode: '',
                day: '',
                startHour: '08',
                startMin: '00',
                endHour: '10',
                endMin: '00',
                venueId: ''
            });
            
            // Silent refresh to show the new entry immediately
            fetchSchedules(true); 
        } catch (error) {
            /** 
             * Server returned a conflict (400). 
             * The error message will contain specifics (e.g., 'Venue already booked').
             */
            const errorMsg = error.response?.data?.message || "Conflict Detected: The slot is not available.";
            toast.error(errorMsg);
        }
    };

    /**
     * @handler handleDeleteClass
     * @description Requests removal of a scheduled slot.
     */
    const handleDeleteClass = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this lecture?")) return;
        
        try {
            await scheduleAPI.delete(id);
            toast.info("Class cancellation finalized.");
            fetchSchedules(true); 
        } catch (error) {
            toast.error("Operation failed: Unable to remove schedule entry.");
        }
    };

    /**
     * @renderer renderMySchedule
     * @description Renders the personal timetable list for the logged-in lecturer.
     */
    const renderMySchedule = () => {
        // Filter global list to show only entries assigned to 'the active user'
        const myClasses = schedule.filter(item => item.lecturerId === user.id);

        return (
            <div className="tab-section transition-fade">
                <h3>My Teaching Itinerary</h3>
                <p className="hint-text">Current assignments for <strong>{user.name}</strong></p>
                
                {loading ? (
                    <div className="skeleton-loader">Updating view...</div>
                ) : myClasses.length > 0 ? (
                    <div className="table-responsive">
                        <table className="schedule-table">
                            <thead>
                                <tr>
                                    <th>Day</th>
                                    <th>Time Window</th>
                                    <th>Course Identity</th>
                                    <th>Assigned Venue</th>
                                    <th>Class Context</th>
                                    <th>Management</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myClasses.map((item) => (
                                    <tr key={item.id}>
                                        <td data-label="Day">{item.day}</td>
                                        <td data-label="Time">{item.startTime} - {item.endTime}</td>
                                        <td data-label="Course">
                                            <strong>{item.Course?.code || item.CourseCode}</strong>
                                        </td>
                                        <td data-label="Venue">{item.Venue?.name}</td>
                                        <td data-label="Class">{item.Level?.name} Lvl, {item.Department?.name}</td>
                                        <td data-label="Action">
                                            <button 
                                                className="cancel-btn action-pill" 
                                                onClick={() => handleDeleteClass(item.id)}
                                                title="Cancel this class"
                                            >
                                                Unschedule
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No active lecture blocks detected on your profile.</p>
                    </div>
                )}
            </div>
        );
    };

    /**
     * @renderer renderSetClass
     * @description Renders the UI for the scheduling wizard.
     */
    const renderSetClass = () => {
        return (
            <div className="tab-section transition-fade">
                <h3>Schedule New Lecture</h3>
                <p className="hint-text">Automatic conflict detection is enabled for venues, lecturers, and student groups.</p>

                <form className="set-class-form" onSubmit={handleSetClass}>
                    <div className="form-row">
                        <div className="form-group flex-1">
                            <label>Assigned Department</label>
                            <select name="departmentId" value={newClass.departmentId} onChange={handleInputChange}>
                                <option value="">-- Choose Dept --</option>
                                {metadata.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group flex-1">
                            <label>Student Level</label>
                            <select name="levelId" value={newClass.levelId} onChange={handleInputChange}>
                                <option value="">-- Choose Level --</option>
                                {metadata.levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group flex-2">
                            <label>Course Information</label>
                            <select name="courseCode" value={newClass.courseCode} onChange={handleInputChange}>
                                <option value="">-- Select Course --</option>
                                {metadata.courses.map(c => <option key={c.code} value={c.code}>{c.code} - {c.title}</option>)}
                            </select>
                        </div>
                        <div className="form-group flex-1">
                            <label>Lecturer</label>
                            <input type="text" value={user.name} disabled className="disabled-lock-input" />
                        </div>
                    </div>

                    <div className="form-row time-row">
                        <div className="form-group flex-1">
                            <label>Day of Week</label>
                            <select name="day" value={newClass.day} onChange={handleInputChange}>
                                <option value="">-- Day --</option>
                                {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="form-group flex-1">
                            <label>Start Window</label>
                            <div className="time-picker-row">
                                <select name="startHour" value={newClass.startHour} onChange={handleInputChange}>
                                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                                <span className="time-sep">:</span>
                                <select name="startMin" value={newClass.startMin} onChange={handleInputChange}>
                                    {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="form-group flex-1">
                            <label>End Window</label>
                            <div className="time-picker-row">
                                <select name="endHour" value={newClass.endHour} onChange={handleInputChange}>
                                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                                <span className="time-sep">:</span>
                                <select name="endMin" value={newClass.endMin} onChange={handleInputChange}>
                                    {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Physical Venue / Room</label>
                        <select name="venueId" value={newClass.venueId} onChange={handleInputChange}>
                            <option value="">-- Select Room --</option>
                            {metadata.venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                    </div>

                    <button type="submit" className="primary-action-btn">Commit to Timetable</button>
                </form>
            </div>
        );
    };

    /**
     * @renderer renderCheckVenue
     * @description Displays a weekly schedule for any selected venue to help the lecturer
     * identify empty windows before attempting to book.
     */
    const renderCheckVenue = () => {
        const venueBookings = schedule.filter(item => item.VenueId === parseInt(selectedVenueId));
        const selectedVenueName = metadata.venues.find(v => v.id === parseInt(selectedVenueId))?.name;

        return (
            <div className="tab-section transition-fade">
                <h3>Venue Availability Matrix</h3>
                <p className="hint-text">Search for free windows in any institutional room.</p>

                <div className="venue-selector-bar">
                    <label>Target Venue:</label>
                    <select value={selectedVenueId} onChange={(e) => setSelectedVenueId(e.target.value)}>
                        <option value="">-- Choose Venue to Inspect --</option>
                        {metadata.venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                </div>

                {selectedVenueId && (
                    <div className="venue-occupancy-report mt-20">
                        <h4>Booking Report for <strong>{selectedVenueName}</strong></h4>
                        {venueBookings.length > 0 ? (
                            <div className="table-responsive">
                                <table className="schedule-table">
                                    <thead>
                                        <tr>
                                            <th>Day</th>
                                            <th>Time Slot</th>
                                            <th>Occupant Course</th>
                                            <th>Supervisor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {venueBookings.map(item => (
                                            <tr key={item.id}>
                                                <td data-label="Day">{item.day}</td>
                                                <td data-label="Time">{item.startTime} - {item.endTime}</td>
                                                <td data-label="Course">{item.Course?.code || item.CourseCode}</td>
                                                <td data-label="Lecturer">{item.lecturer?.name}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p className="success-txt">Venue Empty: No classes are currently scheduled for this location.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="lecturer-dashboard">
            <header className="dashboard-header">
                <div>
                    <h2>Academic Portal</h2>
                    <p className="sub-header-txt">Timetable & Resource Management</p>
                </div>
                <div className="lecturer-identity">
                    <span className="user-icon">👤</span>
                    <span className="user-label">Instructor: <strong>{user.name}</strong></span>
                </div>
            </header>

            {/* Dashboard Navigation System */}
            <nav className="dashboard-nav-tabs">
                <button
                    className={activeTab === 'my_schedule' ? 'tab-btn active' : 'tab-btn'}
                    onClick={() => setActiveTab('my_schedule')}
                >
                    📅 My Timetable
                </button>
                <button
                    className={activeTab === 'set_class' ? 'tab-btn active' : 'tab-btn'}
                    onClick={() => setActiveTab('set_class')}
                >
                    ➕ Schedule Class
                </button>
                <button
                    className={activeTab === 'check_venue' ? 'tab-btn active' : 'tab-btn'}
                    onClick={() => setActiveTab('check_venue')}
                >
                    🔍 Venue Inspector
                </button>
            </nav>

            <main className="dashboard-viewport">
                {activeTab === 'my_schedule' && renderMySchedule()}
                {activeTab === 'set_class' && renderSetClass()}
                {activeTab === 'check_venue' && renderCheckVenue()}
            </main>
        </div>
    );
};

export default LecturerDashboard;


