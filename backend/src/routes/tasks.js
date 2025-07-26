const express = require('express');
const TaskController = require('../controllers/taskController');
const { authenticateToken } = require('../middlewares/auth');
const router = express.Router({ mergeParams: true });

// All routes require authentication
router.use(authenticateToken);

// GET /projects/:projectId/tasks - Get all tasks for a project
router.get('/', TaskController.getAll);

// GET /projects/:projectId/tasks/:taskId - Get specific task
router.get('/:taskId', TaskController.getById);

// POST /projects/:projectId/tasks - Create new task
router.post('/', TaskController.create);

// PUT /projects/:projectId/tasks/:taskId - Update task
router.put('/:taskId', TaskController.update);

// DELETE /projects/:projectId/tasks/:taskId - Delete task
router.delete('/:taskId', TaskController.delete);

module.exports = router; 