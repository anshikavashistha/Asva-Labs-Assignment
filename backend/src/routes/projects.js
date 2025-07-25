const express = require('express');
const ProjectController = require('../controllers/projectController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /projects - Get all projects (all authenticated users)
router.get('/', ProjectController.getAll);

// GET /projects/:id - Get specific project (all authenticated users)
router.get('/:id', ProjectController.getById);

// POST /projects - Create project (all authenticated users)
router.post('/', ProjectController.create);

// PUT /projects/:id - Update project (admin or creator only)
router.put('/:id', ProjectController.update);

// DELETE /projects/:id - Delete project (admin or creator only)
router.delete('/:id', ProjectController.delete);

module.exports = router; 