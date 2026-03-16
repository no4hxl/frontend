import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { dataAPI, scheduleAPI } from '../services/api';
import './LecturerDashboard.css';

/**
 * LecturerDashboard Component
 * 
 * Provides features for lecturers to:
 * 1. View their personal teaching schedule.
 * 2. Set new class slots with automatic conflict detection.
 * 3. Check specific venue availability to avoid booking conflicts.
 */
const LecturerDashboard = () => {
    // Current user context (id, name, role)
    const { user } = useAuth();
    
    // UI state for navigation and loading indicators
    const [activeTab, setActiveTab] = useState('my_schedule');
    const [loading, setLoading] = useState(false);

    // Cached metadata for dropdowns (Depts, Levels, etc.)
    const [metadata, setMetadata] = useState({
        departments: [],
        levels: [],
        courses: [],
        venues: []
    });

    // Master list of all scheduled classes
    const [schedule, setSchedule] = useState([]);

    // Temporary storage for the "Set a Class" form
    const [newClass, setNewClass] = useState({
        departmentId: '',
        levelId: '',
        courseCode: '',
        day: '',
        timeSlot: '',
        venueId: ''
    });

    // Search state for "Check Venue" tab
    const [selectedVenueId, setSelectedVenueId] = useState('');

    // Shared constants for timetable logic
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const timeSlots = ["08:00 - 10:00", "10:00 - 12:00", "12:00 - 14:00", "14:00 - 16:00", "16:00 - 18:00"];

    /**
     * Effect Hook: Fetches organizational metadata on component mount.
     */
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
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
                toast.error("Failed to load metadata.");
            }
        };
        fetchMetadata();
    }, []);

    /**
     * fetchSchedules
     * Synchronizes the timetable data with the server.
     * 
     * @param {boolean} isSilent - If true, re-fetches without showing a full-screen loader.
     */
    const fetchSchedules = async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        
        try {
            const res = await scheduleAPI.getAll();
            setSchedule(res.data);
        } catch (error) {
            console.error("Failed to fetch schedules:", error);
            toast.error("Unable to update schedule data.");
        } finally {
            if (!isSilent) setLoading(false);
        }
    };

    // Initial data fetch on mount
    useEffect(() => {
        fetchSchedules(false);
    }, []);

    /**
     * handleInputChange
     * Updates the specialized "Set a Class" form state.
     */
    const handleInputChange = (e) => {
        setNewClass({
            ...newClass,
            [e.target.name]: e.target.value
        });
    };

    /**
     * handleSetClass
     * Submits a new schedule request to the server.
     * Triggers a background refresh on success.
     */
    const handleSetClass = async (e) => {
        e.preventDefault();

        // Validation: Ensure all fields are selected before sending to API
        if (!newClass.departmentId || !newClass.levelId || !newClass.courseCode || !newClass.day || !newClass.timeSlot || !newClass.venueId) {
            toast.warning("Please fill in all required fields.");
            return;
        }

        try {
            const payload = {
                ...newClass,
                lecturerId: user.id
            };
            await scheduleAPI.create(payload);
            toast.success("Class scheduled successfully!");
            
            // Success: Reset form and refresh list silently
            setNewClass({
                departmentId: '',
                levelId: '',
                courseCode: '',
                day: '',
                timeSlot: '',
                venueId: ''
            });
            fetchSchedules(true); 
        } catch (error) {
            // Display conflict details returned by the server (e.g., Venue already booked)
            const errorMsg = error.response?.data?.message || "Scheduling conflict detected.";
            toast.error(errorMsg);
        }
    };

    /**
     * handleDeleteClass
     * Cancels an existing scheduled class slot.
     */
    const handleDeleteClass = async (id) => {
        try {
            await scheduleAPI.delete(id);
            toast.info("Class has been successfully cancelled.");
            fetchSchedules(true); 
        } catch (error) {
            toast.error("Failed to cancel class.");
        }
    };

    /**
     * renderMySchedule
     * Displays a customized table of classes taught by the current lecturer.
     */
    const renderMySchedule = () => {
        const myClasses = schedule.filter(item => item.lecturerId === user.id);

        return (
            <div className="tab-section">
                <h3>My Upcoming Classes</h3>
                <p className="hint-text">Showing classes scheduled for <strong>{user.name}</strong></p>
                {loading ? <p>Loading...</p> : myClasses.length > 0 ? (
                    <div className="table-responsive">
                        <table className="schedule-table">
                            <thead>
                                <tr>
                                    <th>Day</th>
                                    <th>Time</th>
                                    <th>Course</th>
                                    <th>Venue</th>
                                    <th>Class</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myClasses.map((item) => (
                                    <tr key={item.id}>
                                        <td data-label="Day">{item.day}</td>
                                        <td data-label="Time">{item.timeSlot}</td>
                                        <td data-label="Course">{item.Course?.code || item.CourseCode}</td>
                                        <td data-label="Venue">{item.Venue?.name}</td>
                                        <td data-label="Class">{item.Level?.name} Lvl, {item.Department?.name}</td>
                                        <td data-label="Action">
                                            <button className="cancel-btn" onClick={() => handleDeleteClass(item.id)}>
                                                Cancel
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>You have no classes scheduled yet.</p>
                    </div>
                )}
            </div>
        );
    };

    /**
     * renderSetClass
     * Renders a multi-input form for scheduling new blocks.
     */
    const renderSetClass = () => {
        return (
            <div className="tab-section">
                <h3>Set a New Class</h3>
                <p className="hint-text">The system will automatically prevent double-booking of venues.</p>

                <form className="set-class-form" onSubmit={handleSetClass}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Department</label>
                            <select name="departmentId" value={newClass.departmentId} onChange={handleInputChange}>
                                <option value="">Select Department</option>
                                {metadata.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Level</label>
                            <select name="levelId" value={newClass.levelId} onChange={handleInputChange}>
                                <option value="">Select Level</option>
                                {metadata.levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Course</label>
                            <select name="courseCode" value={newClass.courseCode} onChange={handleInputChange}>
                                <option value="">Select Course</option>
                                {metadata.courses.map(c => <option key={c.code} value={c.code}>{c.code} - {c.title}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Lecturer (Self)</label>
                            <input type="text" value={user.name} disabled className="disabled-input" />
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
                            <select name="timeSlot" value={newClass.timeSlot} onChange={handleInputChange}>
                                <option value="">Select Time</option>
                                {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Venue</label>
                        <select name="venueId" value={newClass.venueId} onChange={handleInputChange}>
                            <option value="">Select Venue</option>
                            {metadata.venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                    </div>

                    <button type="submit" className="submit-btn">Schedule Class</button>
                </form>
            </div>
        );
    };

    /**
     * renderCheckVenue
     * Allows checking any venue to see its full occupancy across the week.
     */
    const renderCheckVenue = () => {
        const venueBookings = schedule.filter(item => item.VenueId === parseInt(selectedVenueId));
        const selectedVenueName = metadata.venues.find(v => v.id === parseInt(selectedVenueId))?.name;

        return (
            <div className="tab-section">
                <h3>Check Venue Availability</h3>
                <p className="hint-text">Select a venue to see all its scheduled classes.</p>

                <div className="venue-selector">
                    <label>Select Venue:</label>
                    <select value={selectedVenueId} onChange={(e) => setSelectedVenueId(e.target.value)}>
                        <option value="">-- Select Venue --</option>
                        {metadata.venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                </div>

                {selectedVenueId && (
                    <div className="venue-schedule">
                        <h4>Schedule for {selectedVenueName}</h4>
                        {venueBookings.length > 0 ? (
                            <div className="table-responsive">
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
                                                <td data-label="Day">{item.day}</td>
                                                <td data-label="Time">{item.timeSlot}</td>
                                                <td data-label="Course">{item.Course?.code || item.CourseCode}</td>
                                                <td data-label="Lecturer">{item.lecturer?.name}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
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
            <header className="dashboard-header">
                <h2>Lecturer Portal</h2>
                <span className="user-badge">Signed in as: <strong>{user.name}</strong></span>
            </header>

            <nav className="dashboard-nav">
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
            </nav>

            <main className="dashboard-body">
                {activeTab === 'my_schedule' && renderMySchedule()}
                {activeTab === 'set_class' && renderSetClass()}
                {activeTab === 'check_venue' && renderCheckVenue()}
            </main>
        </div>
    );
};

export default LecturerDashboard;

