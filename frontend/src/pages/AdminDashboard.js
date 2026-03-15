import React, { useState } from 'react';
import { departments, venues, levels, lecturers } from '../data/mockData';
import './AdminDashboard.css';

/**
 * AdminDashboard Component
 * 
 * Purpose: Allows the administrator to manage system data (Departments, Venues, Levels, Lecturers).
 * Features:
 * - CRUD operations (Create, Read, Delete) for each data type.
 * - Tabbed interface for navigation.
 * - Local state management to simulate database updates.
 */
const AdminDashboard = () => {
    // State to manage the active tab (default: 'departments')
    const [activeTab, setActiveTab] = useState('departments');

    // Local state for system data, initialized from mockData
    const [deptList, setDeptList] = useState(departments);
    const [venueList, setVenueList] = useState(venues);
    const [levelList, setLevelList] = useState(levels);
    const [lecturerList, setLecturerList] = useState(lecturers);

    // State for new item inputs
    const [newItem, setNewItem] = useState('');

    /**
     * Handles switching tabs and clearing the input field.
     */
    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
        setNewItem('');
    };

    /**
     * Handles adding a new item to the currently active list.
     */
    const handleAddItem = (e) => {
        e.preventDefault();
        if (!newItem.trim()) return; // Prevent adding empty items

        switch (activeTab) {
            case 'departments':
                setDeptList([...deptList, newItem]);
                break;
            case 'venues':
                // Venues in mockData are objects {id, name}, so we mimic that structure for consistency
                // For simplicity in this mock, we just use a random ID or length-based ID
                const newVenue = { id: Date.now(), name: newItem };
                setVenueList([...venueList, newVenue]);
                break;
            case 'levels':
                setLevelList([...levelList, newItem]);
                break;
            case 'lecturers':
                // Lecturers are object {id, name}
                const newLecturer = { id: Date.now(), name: newItem };
                setLecturerList([...lecturerList, newLecturer]);
                break;
            default:
                break;
        }
        setNewItem(''); // Clear input
    };

    /**
     * Handles deleting an item from the list.
     * @param {any} itemToDelete - The item or ID of the item to delete
     */
    const handleDeleteItem = (itemToDelete) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;

        switch (activeTab) {
            case 'departments':
                setDeptList(deptList.filter(dept => dept !== itemToDelete));
                break;
            case 'venues':
                setVenueList(venueList.filter(venue => venue.id !== itemToDelete));
                break;
            case 'levels':
                setLevelList(levelList.filter(lvl => lvl !== itemToDelete));
                break;
            case 'lecturers':
                setLecturerList(lecturerList.filter(lect => lect.id !== itemToDelete));
                break;
            default:
                break;
        }
    };

    /**
     * Render the list content based on the active tab.
     */
    const renderContent = () => {
        let list = [];
        let type = '';

        if (activeTab === 'departments') {
            list = deptList;
            type = 'Department';
        } else if (activeTab === 'venues') {
            list = venueList;
            type = 'Venue';
        } else if (activeTab === 'levels') {
            list = levelList;
            type = 'Level';
        } else if (activeTab === 'lecturers') {
            list = lecturerList;
            type = 'Lecturer';
        }

        return (
            <div className="tab-content">
                <h3>Manage {type}s</h3>

                {/* Add Item Form */}
                <form className="add-item-form" onSubmit={handleAddItem}>
                    <input
                        type="text"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder={`Enter new ${type}`}
                    />
                    <button type="submit" className="btn-add">Add {type}</button>
                </form>

                {/* List of Items */}
                <ul className="item-list">
                    {list.map((item, index) => {
                        // Determine display value and key based on data structure
                        let displayValue = '';
                        let id = index;

                        if (activeTab === 'venues' || activeTab === 'lecturers') {
                            displayValue = item.name;
                            id = item.id;
                        } else {
                            displayValue = item;
                            id = item; // For strings like departments/levels, the string itself can be the identifier for deletion
                        }

                        return (
                            <li key={index} className="list-item">
                                <span>{displayValue}</span>
                                <button
                                    className="btn-delete"
                                    onClick={() => handleDeleteItem(id)}
                                >
                                    Delete
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    };

    return (
        <div className="admin-dashboard">
            <h2>Detail Administrator Dashboard</h2>
            <p>Manage system structure and resources.</p>

            <div className="dashboard-container">
                {/* Sidebar / Tabs */}
                <div className="dashboard-tabs">
                    <button
                        className={activeTab === 'departments' ? 'active' : ''}
                        onClick={() => handleTabChange('departments')}
                    >
                        Departments
                    </button>
                    <button
                        className={activeTab === 'venues' ? 'active' : ''}
                        onClick={() => handleTabChange('venues')}
                    >
                        Venues
                    </button>
                    <button
                        className={activeTab === 'levels' ? 'active' : ''}
                        onClick={() => handleTabChange('levels')}
                    >
                        Levels
                    </button>
                    <button
                        className={activeTab === 'lecturers' ? 'active' : ''}
                        onClick={() => handleTabChange('lecturers')}
                    >
                        Lecturers
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="dashboard-content">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
