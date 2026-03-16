import React from 'react';
import './UserManagement.css';

/**
 * UserList Component
 * 
 * Renders a list of system users in a responsive table.
 * Allows administrators to:
 * - Update user roles (Admin/Lecturer)
 * - Trigger password resets
 * - Remove user accounts
 * 
 * @param {Object} props
 * @param {Array} props.users - Array of user objects to display.
 * @param {Function} props.onRoleChange - Handler for updating a user's role.
 * @param {Function} props.onResetPassword - Handler for resetting a user's password.
 * @param {Function} props.onDelete - Handler for deleting a user account.
 */
const UserList = ({ users, onRoleChange, onResetPassword, onDelete }) => {
    // Render fallback UI when no users exist
    if (users.length === 0) {
        return (
            <div className="empty-list">
                <p>No users found in the system.</p>
            </div>
        );
    }

    return (
        <div className="user-list-container table-responsive">
            <table className="schedule-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td data-label="Name" className="font-medium">{user.name}</td>
                            <td data-label="Email">{user.email}</td>
                            <td data-label="Role">
                                <select 
                                    value={user.role} 
                                    onChange={(e) => onRoleChange(user.id, e.target.value)}
                                    className="user-role-select"
                                    aria-label={`Change role for ${user.name}`}
                                >
                                    <option value="lecturer">Lecturer</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </td>
                            <td data-label="Actions">
                                <div className="btn-group mobile-flex">
                                    <button 
                                        className="btn-edit" 
                                        onClick={() => onResetPassword(user.id)}
                                        title="Reset password to 'password123'"
                                        aria-label={`Reset password for ${user.name}`}
                                    >
                                        Reset Pwd
                                    </button>
                                    <button 
                                        className="btn-delete" 
                                        onClick={() => onDelete(user.id)}
                                        aria-label={`Delete user ${user.name}`}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserList;

