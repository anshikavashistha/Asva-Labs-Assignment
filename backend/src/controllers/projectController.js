const { Project, User } = require('../models');
//const CacheService = require('../services/cacheService');
//const EventPublisher = require('../services/eventPublisher');
//const EVENT_TYPES = require('../events/eventTypes');

class ProjectController {
  static async getAll(req, res) {
    try {
      const cacheKey = `projects:tenant:${req.user.tenant_id}`;
      let projects = await CacheService.get(cacheKey);
      
      if (!projects) {
        projects = await Project.findAll({
          where: { tenant_id: req.user.tenant_id },
          include: [{ model: User, as: 'creator', attributes: ['id', 'username', 'email'] }]
        });
        await CacheService.set(cacheKey, projects, 60);
      }
      
      res.json(projects);
    } catch (error) {
      console.error('Get projects error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const project = await Project.findOne({
        where: { 
          id: req.params.id,
          tenant_id: req.user.tenant_id 
        },
        include: [{ model: User, as: 'creator', attributes: ['id', 'username', 'email'] }]
      });

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json(project);
    } catch (error) {
      console.error('Get project error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const projectData = {
        ...req.body,
        created_by: req.user.id,
        tenant_id: req.user.tenant_id
      };

      const project = await Project.create(projectData);
      
      // Invalidate cache
      await CacheService.del(`projects:tenant:${req.user.tenant_id}`);
      
      // Publish Kafka event
      await EventPublisher.publishProjectEvent(EVENT_TYPES.PROJECT_CREATED, project);
      
      res.status(201).json(project);
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const project = await Project.findOne({
        where: { 
          id: req.params.id,
          tenant_id: req.user.tenant_id 
        }
      });

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Only admin or creator can update
      if (req.user.role !== 'admin' && project.created_by !== req.user.id) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      await project.update(req.body);
      
      // Invalidate cache
      await CacheService.del(`projects:tenant:${req.user.tenant_id}`);
      
      // Publish Kafka event
      await EventPublisher.publishProjectEvent(EVENT_TYPES.PROJECT_UPDATED, project);
      
      res.json(project);
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const project = await Project.findOne({
        where: { 
          id: req.params.id,
          tenant_id: req.user.tenant_id 
        }
      });

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Only admin or creator can delete
      if (req.user.role !== 'admin' && project.created_by !== req.user.id) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      await project.destroy();
      
      // Invalidate cache
      await CacheService.del(`projects:tenant:${req.user.tenant_id}`);
      
      // Publish Kafka event
      await EventPublisher.publishProjectEvent(EVENT_TYPES.PROJECT_DELETED, { id: req.params.id });
      
      res.status(204).send();
    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ProjectController;
