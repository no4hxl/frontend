const express = require('express');
const router = express.Router();
const { Department, Venue, Level, Course } = require('../models/index');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * dataRoutes.js
 * Provides generic API endpoints for static data (Departments, Venues, Levels, Courses).
 * Uses a dynamic model mapping to reduce boilerplate code.
 */

// Mapping of route parameters to Sequelize Models
const modelMap = {
    'departments': Department,
    'venues': Venue,
    'levels': Level,
    'courses': Course
};

/**
 * Public Routes
 */

// GET /api/data/:type - Fetch all items of a specific type (e.g., /api/data/venues)
router.get('/:type', async (req, res) => {
    const { type } = req.params;
    const Model = modelMap[type];
    if (!Model) return res.status(404).send();
    
    // Courses are automatically linked to their Department for better UI data
    const options = type === 'courses' ? { include: [Department] } : {};
    const data = await Model.findAll(options);
    res.json(data);
});

/**
 * Admin Protected CRUD Routes
 * Only accessible by authenticated Admin users.
 */

// POST /api/data/:type - Create a new record (venue, dept, etc.)
router.post('/:type', protect, authorize('admin'), async (req, res) => {
    const { type } = req.params;
    const Model = modelMap[type];
    if (!Model) return res.status(404).send();

    try {
        const item = await Model.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT /api/data/:type/:id - Update an existing record
router.put('/:type/:id', protect, authorize('admin'), async (req, res) => {
    const { type, id } = req.params;
    const Model = modelMap[type];
    if (!Model) return res.status(404).send();

    try {
        const item = await Model.findByPk(id);
        if (!item) return res.status(404).json({ message: "Not found" });
        
        await item.update(req.body);
        res.json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE /api/data/:type/:id - Delete a record
router.delete('/:type/:id', protect, authorize('admin'), async (req, res) => {
    const { type, id } = req.params;
    const Model = modelMap[type];
    if (!Model) return res.status(404).send();

    try {
        const item = await Model.findByPk(id);
        if (!item) return res.status(404).json({ message: "Not found" });
        
        await item.destroy();
        res.json({ message: "Deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;

