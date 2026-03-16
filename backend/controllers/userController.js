const bcrypt = require('bcryptjs');
const { User } = require('../models/index');

/**
 * Get all users
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'role'] // Exclude password
        });
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error fetching users" });
    }
};

/**
 * Update User Role
 */
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['admin', 'lecturer'].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.role = role;
        await user.save();

        res.json({ message: "User role updated successfully", user: { id: user.id, name: user.name, role: user.role } });
    } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({ message: "Server error updating user role" });
    }
};

/**
 * Reset User Password to 'password123'
 */
const resetUserPassword = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const hashedPassword = await bcrypt.hash('password123', 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ message: "Password reset successfully to 'password123'" });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "Server error resetting password" });
    }
};

/**
 * Delete User
 */
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Prevent admin from deleting themselves
        if (req.user.id === user.id) {
            return res.status(400).json({ message: "You cannot delete your own account" });
        }

        await user.destroy();
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Server error deleting user" });
    }
};

/**
 * Add New User (Lecturer/Admin)
 */
const addUser = async (req, res) => {
    try {
        const { name, email, role, password } = req.body;

        if (!name || !email || !role || !password) {
            return res.status(400).json({ message: "Please provide all fields" });
        }
        
        if (!['admin', 'lecturer'].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            role,
            password: hashedPassword
        });

        res.status(201).json({ 
            message: "User added successfully",
            user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
        });

    } catch (error) {
        console.error("Error adding user:", error);
        res.status(500).json({ message: "Server error adding user" });
    }
};

module.exports = { getAllUsers, updateUserRole, resetUserPassword, deleteUser, addUser };
