import React, { useState } from 'react';
import { departments, levels, scheduleData } from '../data/mockData';
import './StudentSchedule.css';

const StudentSchedule = () => {
    // State for storing the selected department and level
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');

    // Function to handle department change
    const handleDeptChange = (e) => {
        setSelectedDept(e.target.value);
    };

    // Function to handle level change
    const handleLevelChange = (e) => {
        setSelectedLevel(e.target.value);
    };

    /**
     * Filter the schedule based on user selection.
     * 
     * logic:
     * 1. If no department or level is selected, we could show nothing or all. 
     *    Here, we decided to show the schedule only when BOTH are selected for precision.
     * 2. We use the .filter() method on the mock scheduleData array.
     * 3. The condition checks if the item's department matches selectedDept
     *    AND the item's level matches selectedLevel.
     */
    const filteredSchedule = scheduleData.filter((item) => {
        return (
            item.department === selectedDept &&
            item.level === selectedLevel
        );
    });

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
                        {departments.map((dept, index) => (
                            <option key={index} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="level-select">Level:</label>
                    <select id="level-select" value={selectedLevel} onChange={handleLevelChange}>
                        <option value="">-- Select Level --</option>
                        {levels.map((lvl, index) => (
                            <option key={index} value={lvl}>{lvl} Level</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Schedule Display Section */}
            <div className="schedule-display">
                {selectedDept && selectedLevel ? (
                    <>
                        <h3>Schedule for {selectedDept} - {selectedLevel} Level</h3>
                        {filteredSchedule.length > 0 ? (
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
                                    {filteredSchedule.map((classItem) => (
                                        <tr key={classItem.id}>
                                            <td>{classItem.day}</td>
                                            <td>{classItem.time}</td>
                                            <td>{classItem.courseCode}</td>
                                            <td>{classItem.venue}</td>
                                            <td>{classItem.lecturer}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
