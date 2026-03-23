/**
 * @file userController.js
 * @description Controller managing user accounts and roles.
 * Primarily handles Administrative tasks like user creation, role updates,
 * and password resets.
 */

const bcrypt = require('bcryptjs');
const { User } = require('../models/index');

/**
 * @function getAllUsers
 * @description Fetches all registered users for the admin dashboard.
 * Explicitly excludes sensitive information like passwords.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} Sends JSON array of users.
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            // Security: Never return password hashes in list views
            attributes: ['id', 'name', 'email', 'role'] 
        });
        res.status(200).json(users);
    } catch (error) {
        console.error("[UserController] Fetch Error:", error);
        res.status(500).json({ message: "Internal server error fetching user list" });
    }
};

/**
 * @function updateUserRole
 * @description Transitions a user between roles (e.g., from Lecturer to Admin).
 * 
 * @param {Object} req - Express request object with user ID and new role.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>}
 */
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        // Validation: Only allow predefined roles
        if (!['admin', 'lecturer'].includes(role)) {
            return res.status(400).json({ message: "Invalid role specified" });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "Target user not found" });
        }

        user.role = role;
        await user.save();

        console.log(`[UserController] Role updated for ${user.email} -> ${role}`);
        res.status(200).json({ 
            message: "User role updated successfully", 
            user: { id: user.id, name: user.name, role: user.role } 
        });
    } catch (error) {
        console.error("[UserController] Role Update Error:", error);
        res.status(500).json({ message: "Failed to update user role" });
    }
};

/**
 * @function resetUserPassword
 * @description Resets a user's password to a standard system default.
 * Useful when users are locked out or for onboarding new accounts.
 * 
 * @param {Object} req - Express request object with user ID.
 * @param {Object} res - Express response object.
 */
const resetUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const DEFAULT_PWD = 'password123';

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Security: Hash the default password before saving
        const hashedPassword = await bcrypt.hash(DEFAULT_PWD, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: `Password reset successfully to '${DEFAULT_PWD}'` });
    } catch (error) {
        console.error("[UserController] Reset Error:", error);
        res.status(500).json({ message: "Failed to reset user password" });
    }
};

/**
 * @function deleteUser
 * @description Permits administrative deletion of user accounts.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Safety: Prevent accidental lockout by stopping admins from deleting their own session
        if (req.user.id === user.id) {
            return res.status(400).json({ message: "Account Self-Deletion Blocked: Contact another admin." });
        }

        await user.destroy();
        console.log(`[UserController] User deleted: ${user.email}`);
        res.status(200).json({ message: "User account successfully removed" });
    } catch (error) {
        console.error("[UserController] Deletion Error:", error);
        res.status(500).json({ message: "Failed to delete user" });
    }
};

/**
 * @function addUser
 * @description Manually create a new user account (Admin only).
 */
const addUser = async (req, res) => {
    try {
        const { name, email, role, password } = req.body;

        // Input Sanitation & Validation
        if (!name || !email || !role || !password) {
            return res.status(400).json({ message: "Required fields missing: name, email, role, and password are all mandatory." });
        }
        
        if (!['admin', 'lecturer'].includes(role)) {
            return res.status(400).json({ message: "Invalid role choice" });
        }

        // Email Uniqueness Check
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "A user with this email address already exists in the system." });
        }

        // Hash password for secure rest storage
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            role,
            password: hashedPassword
        });

        res.status(201).json({ 
            message: "Account created successfully",
            user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
        });

    } catch (error) {
        console.error("[UserController] Addition Error:", error);
        res.status(500).json({ message: "Failed to add new user" });
    }
};

module.exports = { getAllUsers, updateUserRole, resetUserPassword, deleteUser, addUser };

