const ProjectController = require('../../src/controllers/projectController');
const ProjectService = require('../../src/services/projectService');

// Mock dependencies
jest.mock('../../src/services/projectService');

describe('ProjectController', () => {
  let mockReq;
  let mockRes;
  let mockJson;
  let mockStatus;
  let mockSend;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup mock response
    mockJson = jest.fn();
    mockSend = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson, send: mockSend });
    mockRes = {
      status: mockStatus,
      json: mockJson,
      send: mockSend
    };
  });

  describe('getAll', () => {
    it('should return all projects successfully', async () => {
      // Arrange
      const mockProjects = [
        { id: 1, name: 'Project 1', description: 'Description 1' },
        { id: 2, name: 'Project 2', description: 'Description 2' }
      ];
      
      mockReq = { user: { id: 1, tenant_id: 1 } };
      ProjectService.getAllProjects.mockResolvedValue(mockProjects);

      // Act
      await ProjectController.getAll(mockReq, mockRes);

      // Assert
      expect(ProjectService.getAllProjects).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(mockProjects);
    });

    it('should handle errors when getting projects', async () => {
      // Arrange
      mockReq = { user: { id: 1, tenant_id: 1 } };
      ProjectService.getAllProjects.mockRejectedValue(new Error('Database error'));

      // Act
      await ProjectController.getAll(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('getById', () => {
    it('should return project by id successfully', async () => {
      // Arrange
      const mockProject = { id: 1, name: 'Project 1', description: 'Description 1' };
      
      mockReq = { params: { id: '1' } };
      ProjectService.findById.mockResolvedValue(mockProject);

      // Act
      await ProjectController.getById(mockReq, mockRes);

      // Assert
      expect(ProjectService.findById).toHaveBeenCalledWith('1');
      expect(mockJson).toHaveBeenCalledWith(mockProject);
    });

    it('should return 404 when project not found', async () => {
      // Arrange
      mockReq = { params: { id: '999' } };
      ProjectService.findById.mockResolvedValue(null);

      // Act
      await ProjectController.getById(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Project not found' });
    });

    it('should handle errors when getting project by id', async () => {
      // Arrange
      mockReq = { params: { id: '1' } };
      ProjectService.findById.mockRejectedValue(new Error('Database error'));

      // Act
      await ProjectController.getById(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('create', () => {
    it('should create project successfully', async () => {
      // Arrange
      const projectData = {
        name: 'New Project',
        description: 'New Description'
      };
      
      const createdProject = {
        id: 3,
        ...projectData,
        created_by: 1,
        tenant_id: 1
      };
      
      mockReq = {
        body: projectData,
        user: { id: 1, tenant_id: 1 }
      };
      
      ProjectService.createProject.mockResolvedValue(createdProject);

      // Act
      await ProjectController.create(mockReq, mockRes);

      // Assert
      expect(ProjectService.createProject).toHaveBeenCalledWith({
        ...projectData,
        created_by: 1,
        tenant_id: 1
      });
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(createdProject);
    });

    it('should handle errors when creating project', async () => {
      // Arrange
      const projectData = {
        name: 'New Project',
        description: 'New Description'
      };
      
      mockReq = {
        body: projectData,
        user: { id: 1, tenant_id: 1 }
      };
      
      ProjectService.createProject.mockRejectedValue(new Error('Database error'));

      // Act
      await ProjectController.create(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('update', () => {
    it('should update project successfully for admin user', async () => {
      // Arrange
      const updateData = {
        name: 'Updated Project',
        description: 'Updated Description'
      };
      
      const existingProject = {
        id: 1,
        name: 'Original Project',
        description: 'Original Description',
        created_by: 2
      };
      
      const updatedProject = {
        id: 1,
        ...updateData,
        created_by: 2
      };
      
      mockReq = {
        params: { id: '1' },
        body: updateData,
        user: { id: 1, role: 'admin', tenant_id: 1 }
      };
      
      ProjectService.findById.mockResolvedValueOnce(existingProject);
      ProjectService.updateProject.mockResolvedValue();
      ProjectService.findById.mockResolvedValueOnce(updatedProject);

      // Act
      await ProjectController.update(mockReq, mockRes);

      // Assert
      expect(ProjectService.findById).toHaveBeenCalledWith('1');
      expect(ProjectService.updateProject).toHaveBeenCalledWith('1', updateData);
      expect(ProjectService.findById).toHaveBeenCalledWith('1');
      expect(mockJson).toHaveBeenCalledWith(updatedProject);
    });

    it('should update project successfully for project creator', async () => {
      // Arrange
      const updateData = {
        name: 'Updated Project',
        description: 'Updated Description'
      };
      
      const existingProject = {
        id: 1,
        name: 'Original Project',
        description: 'Original Description',
        created_by: 1
      };
      
      const updatedProject = {
        id: 1,
        ...updateData,
        created_by: 1
      };
      
      mockReq = {
        params: { id: '1' },
        body: updateData,
        user: { id: 1, role: 'user', tenant_id: 1 }
      };
      
      ProjectService.findById.mockResolvedValueOnce(existingProject);
      ProjectService.updateProject.mockResolvedValue();
      ProjectService.findById.mockResolvedValueOnce(updatedProject);

      // Act
      await ProjectController.update(mockReq, mockRes);

      // Assert
      expect(ProjectService.findById).toHaveBeenCalledWith('1');
      expect(ProjectService.updateProject).toHaveBeenCalledWith('1', updateData);
      expect(mockJson).toHaveBeenCalledWith(updatedProject);
    });

    it('should return 404 when project not found', async () => {
      // Arrange
      mockReq = {
        params: { id: '999' },
        body: { name: 'Updated Project' },
        user: { id: 1, role: 'admin', tenant_id: 1 }
      };
      
      ProjectService.findById.mockResolvedValue(null);

      // Act
      await ProjectController.update(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Project not found' });
    });

    it('should return 403 when user lacks permission', async () => {
      // Arrange
      const existingProject = {
        id: 1,
        name: 'Original Project',
        description: 'Original Description',
        created_by: 2
      };
      
      mockReq = {
        params: { id: '1' },
        body: { name: 'Updated Project' },
        user: { id: 1, role: 'user', tenant_id: 1 }
      };
      
      ProjectService.findById.mockResolvedValue(existingProject);

      // Act
      await ProjectController.update(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
    });

    it('should handle errors when updating project', async () => {
      // Arrange
      const existingProject = {
        id: 1,
        name: 'Original Project',
        description: 'Original Description',
        created_by: 1
      };
      
      mockReq = {
        params: { id: '1' },
        body: { name: 'Updated Project' },
        user: { id: 1, role: 'user', tenant_id: 1 }
      };
      
      ProjectService.findById.mockResolvedValue(existingProject);
      ProjectService.updateProject.mockRejectedValue(new Error('Database error'));

      // Act
      await ProjectController.update(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('delete', () => {
    it('should delete project successfully for admin user', async () => {
      // Arrange
      const existingProject = {
        id: 1,
        name: 'Project to Delete',
        description: 'Description',
        created_by: 2
      };
      
      mockReq = {
        params: { id: '1' },
        user: { id: 1, role: 'admin', tenant_id: 1 }
      };
      
      ProjectService.findById.mockResolvedValue(existingProject);
      ProjectService.deleteProject.mockResolvedValue();

      // Act
      await ProjectController.delete(mockReq, mockRes);

      // Assert
      expect(ProjectService.findById).toHaveBeenCalledWith('1');
      expect(ProjectService.deleteProject).toHaveBeenCalledWith('1');
      expect(mockStatus).toHaveBeenCalledWith(204);
      expect(mockSend).toHaveBeenCalled();
    });

    it('should delete project successfully for project creator', async () => {
      // Arrange
      const existingProject = {
        id: 1,
        name: 'Project to Delete',
        description: 'Description',
        created_by: 1
      };
      
      mockReq = {
        params: { id: '1' },
        user: { id: 1, role: 'user', tenant_id: 1 }
      };
      
      ProjectService.findById.mockResolvedValue(existingProject);
      ProjectService.deleteProject.mockResolvedValue();

      // Act
      await ProjectController.delete(mockReq, mockRes);

      // Assert
      expect(ProjectService.findById).toHaveBeenCalledWith('1');
      expect(ProjectService.deleteProject).toHaveBeenCalledWith('1');
      expect(mockStatus).toHaveBeenCalledWith(204);
      expect(mockSend).toHaveBeenCalled();
    });

    it('should return 404 when project not found', async () => {
      // Arrange
      mockReq = {
        params: { id: '999' },
        user: { id: 1, role: 'admin', tenant_id: 1 }
      };
      
      ProjectService.findById.mockResolvedValue(null);

      // Act
      await ProjectController.delete(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Project not found' });
    });

    it('should return 403 when user lacks permission', async () => {
      // Arrange
      const existingProject = {
        id: 1,
        name: 'Project to Delete',
        description: 'Description',
        created_by: 2
      };
      
      mockReq = {
        params: { id: '1' },
        user: { id: 1, role: 'user', tenant_id: 1 }
      };
      
      ProjectService.findById.mockResolvedValue(existingProject);

      // Act
      await ProjectController.delete(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
    });

    it('should handle errors when deleting project', async () => {
      // Arrange
      const existingProject = {
        id: 1,
        name: 'Project to Delete',
        description: 'Description',
        created_by: 1
      };
      
      mockReq = {
        params: { id: '1' },
        user: { id: 1, role: 'user', tenant_id: 1 }
      };
      
      ProjectService.findById.mockResolvedValue(existingProject);
      ProjectService.deleteProject.mockRejectedValue(new Error('Database error'));

      // Act
      await ProjectController.delete(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });
}); 