import React, { useState, useEffect } from 'react';
import { dataAPI, scheduleAPI } from '../services/api';
import './StudentSchedule.css';

const StudentSchedule = () => {
    const [departments, setDepartments] = useState([]);
    const [levels, setLevels] = useState([]);
    const [schedule, setSchedule] = useState([]);
    
    // State for storing the selected department and level
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [loading, setLoading] = useState(false);

    /**
     * Fetch static metadata on mount
     */
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [deptRes, levelRes] = await Promise.all([
                    dataAPI.getDepartments(),
                    dataAPI.getLevels()
                ]);
                setDepartments(deptRes.data);
                setLevels(levelRes.data);
            } catch (error) {
                console.error("Failed to fetch metadata:", error);
            }
        };
        fetchData();
    }, []);

    /**
     * Fetch schedule when both filters are active
     */
    useEffect(() => {
        if (selectedDept && selectedLevel) {
            const fetchSchedule = async () => {
                setLoading(true);
                try {
                    // Find IDs for the names (since our API filters by ID)
                    const deptId = departments.find(d => d.name === selectedDept)?.id;
                    const levelId = levels.find(l => l.name === selectedLevel)?.id;
                    
                    if (deptId && levelId) {
                        const res = await scheduleAPI.getAll({ departmentId: deptId, levelId: levelId });
                        setSchedule(res.data);
                    }
                } catch (error) {
                    console.error("Failed to fetch schedule:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchSchedule();
        } else {
            setSchedule([]);
        }
    }, [selectedDept, selectedLevel, departments, levels]);

    // Function to handle department change
    const handleDeptChange = (e) => {
        setSelectedDept(e.target.value);
    };

    // Function to handle level change
    const handleLevelChange = (e) => {
        setSelectedLevel(e.target.value);
    };

    return (
        <div className="student-schedule-container">
            <h2>Student Weekly Schedule</h2>
            <p>Select your Department and Level to view your classes.</p>

            {/* Filter Section */}
            <div className="filters">
                <div className="filter-group">
                    <label htmlFor="dept-select">Department:</label>
                    <select id="dept-select" value={selectedDept} onChange={handleDeptChange}>
                        <option value="">-- Select Department --</option>
                        {departments.map((dept) => (
                            <option key={dept.id} value={dept.name}>{dept.name}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="level-select">Level:</label>
                    <select id="level-select" value={selectedLevel} onChange={handleLevelChange}>
                        <option value="">-- Select Level --</option>
                        {levels.map((lvl) => (
                            <option key={lvl.id} value={lvl.name}>{lvl.name} Level</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Schedule Display Section */}
            <div className="schedule-display">
                {loading ? (
                    <p className="loading">Updating schedule...</p>
                ) : selectedDept && selectedLevel ? (
                    <>
                        <h3>Schedule for {selectedDept} - {selectedLevel} Level</h3>
                        {schedule.length > 0 ? (
                            <div className="table-responsive">
                                <table className="schedule-table">
                                    <thead>
                                        <tr>
                                            <th>Day</th>
                                            <th>Time</th>
                                            <th>Course Code</th>
                                            <th>Venue</th>
                                            <th>Lecturer</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {schedule.map((classItem) => (
                                            <tr key={classItem.id}>
                                                <td data-label="Day">{classItem.day}</td>
                                                <td data-label="Time">{classItem.timeSlot}</td>
                                                <td data-label="Course Code">{classItem.Course?.code || classItem.CourseCode}</td>
                                                <td data-label="Venue">{classItem.Venue?.name}</td>
                                                <td data-label="Lecturer">{classItem.lecturer?.name}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="no-data">No classes scheduled for this selection.</p>
                        )}
                    </>
                ) : (
                    <p className="instruction">Please select both Department and Level to see the schedule.</p>
                )}
            </div>
        </div>
    );
};

export default StudentSchedule;
