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
 * AdminDashboard Component
 * 
 * The control center for administrators. 
 * Allows managing users, departments, venues, levels, and courses.
 * Uses a tabbed interface and background refreshes for a seamless experience.
 */
const AdminDashboard = () => {
    // Current active tab state (defaults to 'users')
    const [activeTab, setActiveTab] = useState('users'); 
    
    // List of items being displayed for the current tab
    const [items, setItems] = useState([]);
    
    // Global loading state for tab transitions
    const [loading, setLoading] = useState(false);

    // Configuration for tabs: defines labels and singular terms for UI text
    const tabConfig = {
        users: { label: 'Users', singular: 'User' },
        departments: { label: 'Departments', singular: 'Department' },
        venues: { label: 'Venues', singular: 'Venue' },
        levels: { label: 'Levels', singular: 'Level' },
        courses: { label: 'Courses', singular: 'Course' }
    };

    /**
     * fetchTabData
     * Synchronizes the dashboard state with the backend server.
     * 
     * @param {boolean} isSubscribed - Flag to handle component unmounting safely.
     * @param {boolean} isSilent - If true, re-fetches without showing a loading spinner.
     */
    const fetchTabData = async (isSubscribed = true, isSilent = false) => {
        // Show spinner only during full tab switches to avoid UI flicker
        if (!isSilent) {
            setLoading(true);
            setItems([]); 
        }

        try {
            let fetchedData = [];
            if (activeTab === 'users') {
                // Fetch user-specific data (name, email, role)
                const res = await userAPI.getAll();
                fetchedData = res.data;
            } else {
                // Fetch generic organizational data
                const res = await dataAPI.getAll(activeTab);
                
                // Normalization: Map diverse data structures to a unified {id, name} format for rendering
                fetchedData = res.data.map(item => {
                    const id = item.id || item.code;
                    let name = item.name;
                    
                    if (activeTab === 'courses') {
                        // Display courses as "CSC101 - Introduction..."
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
                console.error(`Sync error (${activeTab}):`, error);
                toast.error(`Unable to synchronize ${activeTab} with server.`);
            }
        } finally {
            if (isSubscribed && !isSilent) {
                setLoading(false);
            }
        }
    };

    /**
     * Effect Hook: Re-fetches data whenever the active tab changes.
     */
    useEffect(() => {
        let isSubscribed = true;
        fetchTabData(isSubscribed, false); // Full load on tab change
        return () => { isSubscribed = false; };
    }, [activeTab]);

    /**
     * handleTabChange
     * Updates the active tab state, triggering the useEffect above.
     */
    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
    };

    /**
     * handleAddItem
     * Sends a POST request to add a new record.
     * Triggers a silent refresh on success to preserve UI state.
     * 
     * @param {string|Object} nameOrPayload - Can be a simple string or a user object.
     */
    const handleAddItem = async (nameOrPayload) => {
        try {
            if (activeTab === 'users') {
                await userAPI.create(nameOrPayload);
                toast.success('User added successfully!');
            } else {
                const name = nameOrPayload;
                // Parse course code/title if needed
                const payload = activeTab === 'courses' 
                    ? { code: name.split(' - ')[0], title: name.split(' - ')[1] || name } 
                    : { name };
                    
                await dataAPI.create(activeTab, payload);
                toast.success(`${tabConfig[activeTab].singular} added successfully!`);
            }
            // Background refresh to show new item instantly
            fetchTabData(true, true);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add item.");
        }
    };

    /**
     * handleEditItem
     * Sends a PUT request to update an existing record name.
     */
    const handleEditItem = async (itemId, newName) => {
        try {
            const payload = activeTab === 'courses' 
                ? { title: newName.split(' - ')[1] || newName } 
                : { name: newName };

            await dataAPI.update(activeTab, itemId, payload);
            toast.info(`${tabConfig[activeTab].singular} updated.`);
            fetchTabData(true, true); // Update list in place
        } catch (error) {
            toast.error("Failed to update item.");
        }
    };

    /**
     * handleDeleteItem
     * Sends a DELETE request to remove a record from the database.
     */
    const handleDeleteItem = async (itemId) => {
        try {
            if (activeTab === 'users') {
                await userAPI.delete(itemId);
                toast.error('User deleted.');
            } else {
                await dataAPI.delete(activeTab, itemId);
                toast.error(`${tabConfig[activeTab].singular} deleted.`);
            }
            fetchTabData(true, true); // Instantly remove from list
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete item.");
        }
    };

    /**
     * handleRoleChange (User specific)
     * Promotes or demotes user permission levels.
     */
    const handleRoleChange = async (userId, newRole) => {
        try {
            await userAPI.updateRole(userId, newRole);
            toast.success("User role updated successfully.");
            fetchTabData(true, true);
        } catch (error) {
            toast.error("Failed to update user role.");
        }
    };

    /**
     * handleResetPassword (User specific)
     * Resets a user's password to the system default ('password123').
     */
    const handleResetPassword = async (userId) => {
        if (window.confirm("Are you sure you want to reset this user's password to 'password123'?")) {
            try {
                await userAPI.resetPassword(userId);
                toast.success("Password reset successfully.");
                fetchTabData(true, true);
            } catch (error) {
                toast.error("Failed to reset password.");
            }
        }
    };

    const currentLabel = tabConfig[activeTab].singular;

    return (
        <div className="admin-dashboard">
            <header className="dashboard-header">
                <h2>Detail Administrator Dashboard</h2>
                <p>Manage system structure and resources.</p>
            </header>

            <div className="dashboard-container">
                {/* Reusable Tab Bar */}
                <TabBar
                    tabConfig={tabConfig}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                />

                <main className="dashboard-content">
                    {loading ? (
                        <p className="loading-text">Synchronizing with server...</p>
                    ) : (
                        <div className="tab-content">
                            <h3>Manage {tabConfig[activeTab].label}</h3>

                            {/* Conditional Rendering: Users tab has specialized forms */}
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

