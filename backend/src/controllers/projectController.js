const ProjectService = require('../services/projectService');
const { User } = require('../models');
// const CacheService = require('../services/cacheService');
// const EventPublisher = require('../services/eventPublisher');
// const EVENT_TYPES = require('../events/eventTypes');

class ProjectController {
  static async getAll(req, res) {
    try {
      // const cacheKey = `projects:tenant:${req.user.tenant_id}`;
      // let projects = await CacheService.get(cacheKey);
      // if (!projects) {
      const projects = await ProjectService.getAllProjects();
      //   await CacheService.set(cacheKey, projects, 60);
      // }
      res.json(projects);
    } catch (error) {
      console.error('Get projects error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const project = await ProjectService.findById(req.params.id);
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
      const project = await ProjectService.createProject(projectData);
      // await CacheService.del(`projects:tenant:${req.user.tenant_id}`);
      // await EventPublisher.publishProjectEvent(EVENT_TYPES.PROJECT_CREATED, project);
      res.status(201).json(project);
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const project = await ProjectService.findById(req.params.id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      if (req.user.role !== 'admin' && project.created_by !== req.user.id) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      await ProjectService.updateProject(req.params.id, req.body);
      // await CacheService.del(`projects:tenant:${req.user.tenant_id}`);
      // await EventPublisher.publishProjectEvent(EVENT_TYPES.PROJECT_UPDATED, project);
      res.json(await ProjectService.findById(req.params.id));
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const project = await ProjectService.findById(req.params.id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      if (req.user.role !== 'admin' && project.created_by !== req.user.id) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      await ProjectService.deleteProject(req.params.id);
      // await CacheService.del(`projects:tenant:${req.user.tenant_id}`);
      // await EventPublisher.publishProjectEvent(EVENT_TYPES.PROJECT_DELETED, { id: req.params.id });
      res.status(204).send();
    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ProjectController;
