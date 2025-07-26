const { Task, Project, User } = require('../models');
//const CacheService = require('../services/cacheService');
//const EventPublisher = require('../services/eventPublisher');
//const EVENT_TYPES = require('../events/eventTypes');

class TaskController {
  static async getAll(req, res) {
    try {
      const { projectId } = req.params;
      const cacheKey = `tasks:project:${projectId}:tenant:${req.user.tenant_id}`;
      
      let tasks = await CacheService.get(cacheKey);
      
      if (!tasks) {
        const whereClause = { 
          project_id: projectId,
          '$Project.tenant_id$': req.user.tenant_id 
        };

        tasks = await Task.findAll({
          where: whereClause,
          include: [
            { 
              model: Project, 
              as: 'Project',
              where: { tenant_id: req.user.tenant_id },
              attributes: ['id', 'name']
            },
            { 
              model: User, 
              as: 'assignee', 
              attributes: ['id', 'username', 'email'] 
            },
            { 
              model: User, 
              as: 'creator', 
              attributes: ['id', 'username', 'email'] 
            }
          ]
        });
        
        await CacheService.set(cacheKey, tasks, 60);
      }
      
      res.json(tasks);
    } catch (error) {
      console.error('Get tasks error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { projectId, taskId } = req.params;
      
      const task = await Task.findOne({
        where: { 
          id: taskId,
          project_id: projectId
        },
        include: [
          { 
            model: Project, 
            as: 'Project',
            where: { tenant_id: req.user.tenant_id },
            attributes: ['id', 'name']
          },
          { 
            model: User, 
            as: 'assignee', 
            attributes: ['id', 'username', 'email'] 
          },
          { 
            model: User, 
            as: 'creator', 
            attributes: ['id', 'username', 'email'] 
          }
        ]
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json(task);
    } catch (error) {
      console.error('Get task error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const { projectId } = req.params;
      
      // Verify project exists and belongs to user's tenant
      const project = await Project.findOne({
        where: { 
          id: projectId,
          tenant_id: req.user.tenant_id 
        }
      });

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const taskData = {
        ...req.body,
        project_id: projectId,
        created_by: req.user.id
      };

      const task = await Task.create(taskData);
      
      // Invalidate cache
      await CacheService.del(`tasks:project:${projectId}:tenant:${req.user.tenant_id}`);
      
      // Publish Kafka event
      await EventPublisher.publishTaskEvent(EVENT_TYPES.TASK_CREATED, task);
      
      res.status(201).json(task);
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { projectId, taskId } = req.params;
      
      const task = await Task.findOne({
        where: { 
          id: taskId,
          project_id: projectId
        },
        include: [
          { 
            model: Project, 
            as: 'Project',
            where: { tenant_id: req.user.tenant_id }
          }
        ]
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Only admin, creator, or assignee can update
      if (req.user.role !== 'admin' && 
          task.created_by !== req.user.id && 
          task.assigned_to !== req.user.id) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      await task.update(req.body);
      
      // Invalidate cache
      await CacheService.del(`tasks:project:${projectId}:tenant:${req.user.tenant_id}`);
      
      // Publish Kafka event
      await EventPublisher.publishTaskEvent(EVENT_TYPES.TASK_UPDATED, task);
      
      res.json(task);
    } catch (error) {
      console.error('Update task error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { projectId, taskId } = req.params;
      
      const task = await Task.findOne({
        where: { 
          id: taskId,
          project_id: projectId
        },
        include: [
          { 
            model: Project, 
            as: 'Project',
            where: { tenant_id: req.user.tenant_id }
          }
        ]
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Only admin or creator can delete
      if (req.user.role !== 'admin' && task.created_by !== req.user.id) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      await task.destroy();
      
      // Invalidate cache
      await CacheService.del(`tasks:project:${projectId}:tenant:${req.user.tenant_id}`);
      
      // Publish Kafka event
      await EventPublisher.publishTaskEvent(EVENT_TYPES.TASK_DELETED, { id: taskId });
      
      res.status(204).send();
    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = TaskController; 