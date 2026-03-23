/**
 * @file AdminDashboard.js
 * @description Central administrative control panel for the application.
 * Provides granular management of users, departments, venues, and curriculum.
 * 
 * Features:
 * - Tabbed resource navigation
 * - Dynamic data synchronization (eager & silent fetches)
 * - User role management & password recovery
 * - Unified CRUD interface for organizational entities.
 */

import React, { useState, useEffect } from 'react';
import TabBar from '../components/admin/TabBar';
import AddItemForm from '../components/admin/AddItemForm';
import ItemList from '../components/admin/ItemList';
import UserList from '../components/admin/UserList';
import AddUserForm from '../components/admin/AddUserForm';
import { toast } from 'react-toastify';
import { dataAPI, userAPI } from '../services/api';
import './AdminDashboard.css';

/**
 * @component AdminDashboard
 * @description Root component for the Admin view.
 */
const AdminDashboard = () => {
    
    /**
     * @state activeTab
     * @description Controls which domain (users, depts, etc.) is currently being managed.
     */
    const [activeTab, setActiveTab] = useState('users'); 
    
    /**
     * @state items
     * @description Local cache of records retrieved from the server for the current tab.
     */
    const [items, setItems] = useState([]);
    
    /**
     * @state loading
     * @description Toggles visibility of the global data synchronization spinner.
     */
    const [loading, setLoading] = useState(false);

    /**
     * @constant tabConfig
     * @description Domain metadata used for dynamic UI string generation (labels, titles).
     */
    const tabConfig = {
        users: { label: 'Users', singular: 'User' },
        departments: { label: 'Departments', singular: 'Department' },
        venues: { label: 'Venues', singular: 'Venue' },
        levels: { label: 'Levels', singular: 'Level' },
        courses: { label: 'Courses', singular: 'Course' }
    };

    /**
     * @function fetchTabData
     * @description Synchronizes the component state with the backend database.
     * 
     * @async
     * @param {boolean} isSubscribed - Safety flag to prevent state updates on unmounted component.
     * @param {boolean} isSilent - If true, reloads data in the background without UI blocking.
     */
    const fetchTabData = async (isSubscribed = true, isSilent = false) => {
        // UI Polish: Only show spinner on major context switches
        if (!isSilent) {
            setLoading(true);
            setItems([]); // Clear list during transition
        }

        try {
            let fetchedData = [];
            
            // Domain-specific fetch logic
            if (activeTab === 'users') {
                const res = await userAPI.getAll();
                fetchedData = res.data;
            } else {
                // Generic organizational data
                const res = await dataAPI.getAll(activeTab);
                
                // Normalization: Canonical data structure {id, name} for ItemList consumption
                fetchedData = res.data.map(item => {
                    const id = item.id || item.code;
                    let name = item.name;
                    
                    // Specific formatting for the Course domain
                    if (activeTab === 'courses') {
                        name = item.title ? `${item.code} - ${item.title}` : item.code;
                    }
                    
                    return { id, name };
                });
            }

            if (isSubscribed) {
                setItems(fetchedData);
            }
        } catch (error) {
            if (isSubscribed) {
                console.error(`[AdminSync] Fail (${activeTab}):`, error);
                toast.error(`Sync error: Unable to retrieve latest ${activeTab}.`);
            }
        } finally {
            if (isSubscribed && !isSilent) {
                setLoading(false);
            }
        }
    };

    /**
     * @lifecycle useEffect
     * @trigger activeTab changes
     * @description Dispatches data fetch whenever the user navigates to a different dashboard tab.
     */
    useEffect(() => {
        let isSubscribed = true;
        fetchTabData(isSubscribed, false); 
        return () => { isSubscribed = false; };
    }, [activeTab]);

    /**
     * @handler handleTabChange
     * @param {string} tabName - Target tab ID.
     */
    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
    };

    /**
     * @handler handleAddItem
     * @description Persists a new record to the backend.
     * 
     * @param {string|Object} nameOrPayload - Canonical data for the new item.
     */
    const handleAddItem = async (nameOrPayload) => {
        try {
            if (activeTab === 'users') {
                await userAPI.create(nameOrPayload);
                toast.success('User account provisioned successfully.');
            } else {
                const name = nameOrPayload;
                // Deconstruct course titles if necessary
                const payload = activeTab === 'courses' 
                    ? { code: name.split(' - ')[0], title: name.split(' - ')[1] || name } 
                    : { name };
                    
                await dataAPI.create(activeTab, payload);
                toast.success(`${tabConfig[activeTab].singular} synchronized.`);
            }
            
            // Post-action: Silently refresh list to reflect changes
            fetchTabData(true, true);
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed.");
        }
    };

    /**
     * @handler handleEditItem
     * @description Requests a name/title update for an existing resource.
     */
    const handleEditItem = async (itemId, newName) => {
        try {
            const payload = activeTab === 'courses' 
                ? { title: newName.split(' - ')[1] || newName } 
                : { name: newName };

            await dataAPI.update(activeTab, itemId, payload);
            toast.info(`Updated: ${tabConfig[activeTab].singular}`);
            fetchTabData(true, true); 
        } catch (error) {
            toast.error("Resource update failed.");
        }
    };

    /**
     * @handler handleDeleteItem
     * @description Triggers resource deletion logic.
     */
    const handleDeleteItem = async (itemId) => {
        try {
            if (activeTab === 'users') {
                await userAPI.delete(itemId);
                toast.error('User record permanently removed.');
            } else {
                await dataAPI.delete(activeTab, itemId);
                toast.error(`${tabConfig[activeTab].singular} purged.`);
            }
            fetchTabData(true, true);
        } catch (error) {
            toast.error(error.response?.data?.message || "Deletion failed.");
        }
    };

    /**
     * @handler handleRoleChange
     * @description Adjusts user authorization levels (Admin <-> Lecturer).
     */
    const handleRoleChange = async (userId, newRole) => {
        try {
            await userAPI.updateRole(userId, newRole);
            toast.success("Permission role adjusted.");
            fetchTabData(true, true);
        } catch (error) {
            toast.error("Role update failed.");
        }
    };

    /**
     * @handler handleResetPassword
     * @description Administrative override for user password locks.
     */
    const handleResetPassword = async (userId) => {
        if (window.confirm("Perform administrative password reset to system default?")) {
            try {
                await userAPI.resetPassword(userId);
                toast.success("Reset Complete: Default credentials restored.");
                fetchTabData(true, true);
            } catch (error) {
                toast.error("Reset operation failed.");
            }
        }
    };

    /**
     * @constant currentLabel
     * @description Display name for the currently selected resource type.
     */
    const currentLabel = tabConfig[activeTab].singular;

    return (
        <div className="admin-dashboard">
            <header className="dashboard-header">
                <h2>Administrative Control Hub</h2>
                <p>Global systems management and resource orchestration.</p>
            </header>

            <div className="dashboard-container">
                {/* Visual Tab Selection */}
                <TabBar
                    tabConfig={tabConfig}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                />

                <main className="dashboard-content">
                    {loading ? (
                        <div className="loader-container">
                            <p className="loading-text">Synchronizing platform data...</p>
                        </div>
                    ) : (
                        <div className="tab-content transition-fade">
                            <h3>{tabConfig[activeTab].label} Management</h3>

                            {/* DOM Logic: Conditional form selection based on active tab context */}
                            {activeTab === 'users' ? (
                                <>
                                    <AddUserForm existingUsers={items} onAdd={handleAddItem} />
                                    <UserList 
                                        users={items} 
                                        onRoleChange={handleRoleChange} 
                                        onResetPassword={handleResetPassword} 
                                        onDelete={handleDeleteItem} 
                                    />
                                </>
                            ) : (
                                <>
                                    <AddItemForm
                                        label={currentLabel}
                                        existingItems={items}
                                        onAdd={handleAddItem}
                                    />

                                    <ItemList
                                        items={items}
                                        onEdit={handleEditItem}
                                        onDelete={handleDeleteItem}
                                        label={currentLabel}
                                    />
                                </>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;


