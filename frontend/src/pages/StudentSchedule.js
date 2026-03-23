/**
 * @file StudentSchedule.js
 * @description Public-facing Student Timetable Viewer.
 * Allows students to filter and view their weekly lecture schedules 
 * based on Department and Level.
 */

import React, { useState, useEffect } from 'react';
import { dataAPI, scheduleAPI } from '../services/api';
import './StudentSchedule.css';

/**
 * @component StudentSchedule
 * @description Provides a read-only interface for students to access their class schedules.
 */
const StudentSchedule = () => {
    
    /**
     * @state departments
     * @description Collection of available academic departments fetched from the system.
     */
    const [departments, setDepartments] = useState([]);
    
    /**
     * @state levels
     * @description Collection of academic levels (e.g., 100, 200) available for selection.
     */
    const [levels, setLevels] = useState([]);
    
    /**
     * @state schedule
     * @description Filtered list of schedule entries matching the student's current selection.
     */
    const [schedule, setSchedule] = useState([]);
    
    /**
     * @state selectedDept
     * @description Currently selected department name from the dropdown.
     */
    const [selectedDept, setSelectedDept] = useState('');
    
    /**
     * @state selectedLevel
     * @description Currently selected level name from the dropdown.
     */
    const [selectedLevel, setSelectedLevel] = useState('');
    
    /**
     * @state loading
     * @description Tracks the status of the asynchronous schedule fetch.
     */
    const [loading, setLoading] = useState(false);

    /**
     * @lifecycle useEffect
     * @description Pulls organizational metadata (Departments/Levels) on component mount.
     */
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [deptRes, levelRes] = await Promise.all([
                    dataAPI.getDepartments(),
                    dataAPI.getLevels()
                ]);
                setDepartments(deptRes.data);
                setLevels(levelRes.data);
            } catch (error) {
                console.error("[StudentInit] Metadata failure:", error);
            }
        };
        fetchMetadata();
    }, []);

    /**
     * @lifecycle useEffect
     * @trigger selectedDept or selectedLevel changes
     * @description Automatically refreshes the timetable whenever the user adjusts filters.
     */
    useEffect(() => {
        // Only fetch if both critical filters are defined
        if (selectedDept && selectedLevel) {
            const fetchSchedule = async () => {
                setLoading(true);
                try {
                    // Map display names back to IDs for API query
                    const deptId = departments.find(d => d.name === selectedDept)?.id;
                    const levelId = levels.find(l => l.name === selectedLevel)?.id;
                    
                    if (deptId && levelId) {
                        const res = await scheduleAPI.getAll({ departmentId: deptId, levelId: levelId });
                        setSchedule(res.data);
                    }
                } catch (error) {
                    console.error("[StudentSync] Schedule fetch failure:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchSchedule();
        } else {
            // Reset results if filters are cleared
            setSchedule([]);
        }
    }, [selectedDept, selectedLevel, departments, levels]);

    /**
     * @handler handleDeptChange
     * @param {Object} e - Event object from the select tag.
     */
    const handleDeptChange = (e) => {
        setSelectedDept(e.target.value);
    };

    /**
     * @handler handleLevelChange
     * @param {Object} e - Event object from the select tag.
     */
    const handleLevelChange = (e) => {
        setSelectedLevel(e.target.value);
    };

    return (
        <div className="student-schedule-container">
            <header className="schedule-header">
                <h2>Student Academic Timetable</h2>
                <p>Access your weekly lecture schedule by specifying your academic details.</p>
            </header>

            {/* Selection Interface */}
            <div className="filters-card card-shadow">
                <div className="filter-group">
                    <label htmlFor="dept-select">Department:</label>
                    <select id="dept-select" value={selectedDept} onChange={handleDeptChange}>
                        <option value="">-- Choose Department --</option>
                        {departments.map((dept) => (
                            <option key={dept.id} value={dept.name}>{dept.name}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="level-select">Current Level:</label>
                    <select id="level-select" value={selectedLevel} onChange={handleLevelChange}>
                        <option value="">-- Choose Level --</option>
                        {levels.map((lvl) => (
                            <option key={lvl.id} value={lvl.name}>{lvl.name} Lvl</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Data Viewport */}
            <div className="schedule-display transition-fade">
                {loading ? (
                    <div className="loader-msg">
                        <p className="pulse">Updating timetable entries...</p>
                    </div>
                ) : selectedDept && selectedLevel ? (
                    <div className="schedule-results">
                        <h3>{selectedDept} - {selectedLevel} Level</h3>
                        {schedule.length > 0 ? (
                            <div className="table-responsive">
                                <table className="schedule-table">
                                    <thead>
                                        <tr>
                                            <th>Day</th>
                                            <th>Time Slot</th>
                                            <th>Course Identity</th>
                                            <th>Venue Location</th>
                                            <th>Instructor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {schedule.map((classItem) => (
                                            <tr key={classItem.id}>
                                                <td data-label="Day">{classItem.day}</td>
                                                <td data-label="Time">{classItem.startTime} - {classItem.endTime}</td>
                                                <td data-label="Course">
                                                    <strong>{classItem.Course?.code || classItem.CourseCode}</strong>
                                                </td>
                                                <td data-label="Venue">{classItem.Venue?.name}</td>
                                                <td data-label="Lecturer">{classItem.lecturer?.name}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>No scheduled classes found for this department/level combination.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="instruction-box">
                        <p>Select your <strong>Department</strong> and <strong>Level</strong> above to load your timetable.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentSchedule;

