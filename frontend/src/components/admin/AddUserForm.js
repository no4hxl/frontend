import React, { useState } from 'react';
import './UserManagement.css';

/**
 * AddUserForm Component
 * 
 * Provides a form for administrators to create new users in the system.
 * Handles validation, duplicate checking based on email, and form submission.
 * 
 * @param {Object} props
 * @param {Array} props.existingUsers - Current list of users to check for duplicate emails.
 * @param {Function} props.onAdd - Callback function to handle the addition of a new user.
 */
const AddUserForm = ({ existingUsers, onAdd }) => {
    // State for tracking form input values
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'lecturer',
        password: 'password123' // Standard default password for new accounts
    });

    // State for managing form-level error messages
    const [error, setError] = useState('');

    /**
     * Updates form state on input change and clears any existing errors.
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error message when user starts typing again
        if (error) setError('');
    };

    /**
     * Validates and processes the form submission.
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        
        const { name, email, role, password } = formData;
        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        // Basic requirement validation
        if (!trimmedName || !trimmedEmail || !trimmedPassword) {
            setError('Please fill in all required fields.');
            return;
        }

        // Email uniqueness validation
        const isDuplicate = existingUsers.some(
            (user) => user.email.toLowerCase() === trimmedEmail.toLowerCase()
        );
        
        if (isDuplicate) {
            setError(`A user with the email "${trimmedEmail}" already exists.`);
            return;
        }

        // Pass the cleaned data to the parent component
        onAdd({
            name: trimmedName,
            email: trimmedEmail,
            role,
            password: trimmedPassword
        });

        // Reset form to initial state after successful addition
        setFormData({
            name: '',
            email: '',
            role: 'lecturer',
            password: 'password123'
        });
        setError('');
    };

    return (
        <form className="add-item-form user-form" onSubmit={handleSubmit}>
            <div className="user-form-row">
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Full Name (e.g. Dr. John Doe)"
                    className="user-form-input"
                    aria-label="Full Name"
                    required
                />
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email Address"
                    className="user-form-input"
                    aria-label="Email Address"
                    required
                />
                <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="user-form-select"
                    aria-label="User Role"
                >
                    <option value="lecturer">Lecturer</option>
                    <option value="admin">Admin</option>
                </select>
                <input
                    type="text"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                    className="user-form-password"
                    aria-label="Initial Password"
                    required
                />
                <button type="submit" className="btn-add">Add User</button>
            </div>
            
            {/* Feedback for validation errors */}
            {error && <p className="form-error" role="alert">{error}</p>}
        </form>
    );
};

export default AddUserForm;

