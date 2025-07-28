const TaskController = require('../../src/controllers/taskController');
const TaskService = require('../../src/services/taskService');
const { Project } = require('../../src/models');

// Mock dependencies
jest.mock('../../src/services/taskService');
jest.mock('../../src/models');

describe('TaskController', () => {
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
    it('should return all tasks successfully', async () => {
      // Arrange
      const mockTasks = [
        { id: 1, title: 'Task 1', description: 'Description 1', project_id: 1 },
        { id: 2, title: 'Task 2', description: 'Description 2', project_id: 1 }
      ];
      
      mockReq = { params: { projectId: '1' }, user: { id: 1, tenant_id: 1 } };
      TaskService.getAllTasks.mockResolvedValue(mockTasks);

      // Act
      await TaskController.getAll(mockReq, mockRes);

      // Assert
      expect(TaskService.getAllTasks).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(mockTasks);
    });

    it('should handle errors when getting tasks', async () => {
      // Arrange
      mockReq = { params: { projectId: '1' }, user: { id: 1, tenant_id: 1 } };
      TaskService.getAllTasks.mockRejectedValue(new Error('Database error'));

      // Act
      await TaskController.getAll(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('getById', () => {
    it('should return task by id successfully', async () => {
      // Arrange
      const mockTask = { id: 1, title: 'Task 1', description: 'Description 1', project_id: 1 };
      
      mockReq = { params: { taskId: '1' } };
      TaskService.findById.mockResolvedValue(mockTask);

      // Act
      await TaskController.getById(mockReq, mockRes);

      // Assert
      expect(TaskService.findById).toHaveBeenCalledWith('1');
      expect(mockJson).toHaveBeenCalledWith(mockTask);
    });

    it('should return 404 when task not found', async () => {
      // Arrange
      mockReq = { params: { taskId: '999' } };
      TaskService.findById.mockResolvedValue(null);

      // Act
      await TaskController.getById(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Task not found' });
    });

    it('should handle errors when getting task by id', async () => {
      // Arrange
      mockReq = { params: { taskId: '1' } };
      TaskService.findById.mockRejectedValue(new Error('Database error'));

      // Act
      await TaskController.getById(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('create', () => {
    it('should create task successfully', async () => {
      // Arrange
      const taskData = {
        title: 'New Task',
        description: 'New Description',
        status: 'pending'
      };
      
      const mockProject = {
        id: 1,
        name: 'Test Project',
        tenant_id: 1
      };
      
      const createdTask = {
        id: 3,
        ...taskData,
        project_id: 1,
        created_by: 1
      };
      
      mockReq = {
        params: { projectId: '1' },
        body: taskData,
        user: { id: 1, tenant_id: 1 }
      };
      
      Project.findOne.mockResolvedValue(mockProject);
      TaskService.createTask.mockResolvedValue(createdTask);

      // Act
      await TaskController.create(mockReq, mockRes);

      // Assert
      expect(Project.findOne).toHaveBeenCalledWith({
        where: {
          id: '1',
          tenant_id: 1
        }
      });
      expect(TaskService.createTask).toHaveBeenCalledWith({
        ...taskData,
        project_id: '1',
        created_by: 1
      });
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(createdTask);
    });

    it('should return 404 when project not found', async () => {
      // Arrange
      const taskData = {
        title: 'New Task',
        description: 'New Description'
      };
      
      mockReq = {
        params: { projectId: '999' },
        body: taskData,
        user: { id: 1, tenant_id: 1 }
      };
      
      Project.findOne.mockResolvedValue(null);

      // Act
      await TaskController.create(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Project not found' });
      expect(TaskService.createTask).not.toHaveBeenCalled();
    });

    it('should handle errors when creating task', async () => {
      // Arrange
      const taskData = {
        title: 'New Task',
        description: 'New Description'
      };
      
      mockReq = {
        params: { projectId: '1' },
        body: taskData,
        user: { id: 1, tenant_id: 1 }
      };
      
      Project.findOne.mockResolvedValue({ id: 1, tenant_id: 1 });
      TaskService.createTask.mockRejectedValue(new Error('Database error'));

      // Act
      await TaskController.create(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('update', () => {
    it('should update task successfully for admin user', async () => {
      // Arrange
      const updateData = {
        title: 'Updated Task',
        description: 'Updated Description',
        status: 'completed'
      };
      
      const existingTask = {
        id: 1,
        title: 'Original Task',
        description: 'Original Description',
        created_by: 2,
        assigned_to: 3
      };
      
      const updatedTask = {
        id: 1,
        ...updateData,
        created_by: 2,
        assigned_to: 3
      };
      
      mockReq = {
        params: { projectId: '1', taskId: '1' },
        body: updateData,
        user: { id: 1, role: 'admin', tenant_id: 1 }
      };
      
      TaskService.findById.mockResolvedValueOnce(existingTask);
      TaskService.updateTask.mockResolvedValue();
      TaskService.findById.mockResolvedValueOnce(updatedTask);

      // Act
      await TaskController.update(mockReq, mockRes);

      // Assert
      expect(TaskService.findById).toHaveBeenCalledWith('1');
      expect(TaskService.updateTask).toHaveBeenCalledWith('1', updateData);
      expect(TaskService.findById).toHaveBeenCalledWith('1');
      expect(mockJson).toHaveBeenCalledWith(updatedTask);
    });

    it('should update task successfully for task creator', async () => {
      // Arrange
      const updateData = {
        title: 'Updated Task',
        description: 'Updated Description'
      };
      
      const existingTask = {
        id: 1,
        title: 'Original Task',
        description: 'Original Description',
        created_by: 1,
        assigned_to: 2
      };
      
      const updatedTask = {
        id: 1,
        ...updateData,
        created_by: 1,
        assigned_to: 2
      };
      
      mockReq = {
        params: { projectId: '1', taskId: '1' },
        body: updateData,
        user: { id: 1, role: 'user', tenant_id: 1 }
      };
      
      TaskService.findById.mockResolvedValueOnce(existingTask);
      TaskService.updateTask.mockResolvedValue();
      TaskService.findById.mockResolvedValueOnce(updatedTask);

      // Act
      await TaskController.update(mockReq, mockRes);

      // Assert
      expect(TaskService.findById).toHaveBeenCalledWith('1');
      expect(TaskService.updateTask).toHaveBeenCalledWith('1', updateData);
      expect(mockJson).toHaveBeenCalledWith(updatedTask);
    });

    it('should update task successfully for task assignee', async () => {
      // Arrange
      const updateData = {
        title: 'Updated Task',
        description: 'Updated Description'
      };
      
      const existingTask = {
        id: 1,
        title: 'Original Task',
        description: 'Original Description',
        created_by: 2,
        assigned_to: 1
      };
      
      const updatedTask = {
        id: 1,
        ...updateData,
        created_by: 2,
        assigned_to: 1
      };
      
      mockReq = {
        params: { projectId: '1', taskId: '1' },
        body: updateData,
        user: { id: 1, role: 'user', tenant_id: 1 }
      };
      
      TaskService.findById.mockResolvedValueOnce(existingTask);
      TaskService.updateTask.mockResolvedValue();
      TaskService.findById.mockResolvedValueOnce(updatedTask);

      // Act
      await TaskController.update(mockReq, mockRes);

      // Assert
      expect(TaskService.findById).toHaveBeenCalledWith('1');
      expect(TaskService.updateTask).toHaveBeenCalledWith('1', updateData);
      expect(mockJson).toHaveBeenCalledWith(updatedTask);
    });

    it('should return 404 when task not found', async () => {
      // Arrange
      mockReq = {
        params: { projectId: '1', taskId: '999' },
        body: { title: 'Updated Task' },
        user: { id: 1, role: 'admin', tenant_id: 1 }
      };
      
      TaskService.findById.mockResolvedValue(null);

      // Act
      await TaskController.update(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Task not found' });
    });

    it('should return 403 when user lacks permission', async () => {
      // Arrange
      const existingTask = {
        id: 1,
        title: 'Original Task',
        description: 'Original Description',
        created_by: 2,
        assigned_to: 3
      };
      
      mockReq = {
        params: { projectId: '1', taskId: '1' },
        body: { title: 'Updated Task' },
        user: { id: 1, role: 'user', tenant_id: 1 }
      };
      
      TaskService.findById.mockResolvedValue(existingTask);

      // Act
      await TaskController.update(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
    });

    it('should handle errors when updating task', async () => {
      // Arrange
      const existingTask = {
        id: 1,
        title: 'Original Task',
        description: 'Original Description',
        created_by: 1,
        assigned_to: 2
      };
      
      mockReq = {
        params: { projectId: '1', taskId: '1' },
        body: { title: 'Updated Task' },
        user: { id: 1, role: 'user', tenant_id: 1 }
      };
      
      TaskService.findById.mockResolvedValue(existingTask);
      TaskService.updateTask.mockRejectedValue(new Error('Database error'));

      // Act
      await TaskController.update(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('delete', () => {
    it('should delete task successfully for admin user', async () => {
      // Arrange
      const existingTask = {
        id: 1,
        title: 'Task to Delete',
        description: 'Description',
        created_by: 2
      };
      
      mockReq = {
        params: { projectId: '1', taskId: '1' },
        user: { id: 1, role: 'admin', tenant_id: 1 }
      };
      
      TaskService.findById.mockResolvedValue(existingTask);
      TaskService.deleteTask.mockResolvedValue();

      // Act
      await TaskController.delete(mockReq, mockRes);

      // Assert
      expect(TaskService.findById).toHaveBeenCalledWith('1');
      expect(TaskService.deleteTask).toHaveBeenCalledWith('1');
      expect(mockStatus).toHaveBeenCalledWith(204);
      expect(mockSend).toHaveBeenCalled();
    });

    it('should delete task successfully for task creator', async () => {
      // Arrange
      const existingTask = {
        id: 1,
        title: 'Task to Delete',
        description: 'Description',
        created_by: 1
      };
      
      mockReq = {
        params: { projectId: '1', taskId: '1' },
        user: { id: 1, role: 'user', tenant_id: 1 }
      };
      
      TaskService.findById.mockResolvedValue(existingTask);
      TaskService.deleteTask.mockResolvedValue();

      // Act
      await TaskController.delete(mockReq, mockRes);

      // Assert
      expect(TaskService.findById).toHaveBeenCalledWith('1');
      expect(TaskService.deleteTask).toHaveBeenCalledWith('1');
      expect(mockStatus).toHaveBeenCalledWith(204);
      expect(mockSend).toHaveBeenCalled();
    });

    it('should return 404 when task not found', async () => {
      // Arrange
      mockReq = {
        params: { projectId: '1', taskId: '999' },
        user: { id: 1, role: 'admin', tenant_id: 1 }
      };
      
      TaskService.findById.mockResolvedValue(null);

      // Act
      await TaskController.delete(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Task not found' });
    });

    it('should return 403 when user lacks permission', async () => {
      // Arrange
      const existingTask = {
        id: 1,
        title: 'Task to Delete',
        description: 'Description',
        created_by: 2
      };
      
      mockReq = {
        params: { projectId: '1', taskId: '1' },
        user: { id: 1, role: 'user', tenant_id: 1 }
      };
      
      TaskService.findById.mockResolvedValue(existingTask);

      // Act
      await TaskController.delete(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
    });

    it('should handle errors when deleting task', async () => {
      // Arrange
      const existingTask = {
        id: 1,
        title: 'Task to Delete',
        description: 'Description',
        created_by: 1
      };
      
      mockReq = {
        params: { projectId: '1', taskId: '1' },
        user: { id: 1, role: 'user', tenant_id: 1 }
      };
      
      TaskService.findById.mockResolvedValue(existingTask);
      TaskService.deleteTask.mockRejectedValue(new Error('Database error'));

      // Act
      await TaskController.delete(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });
}); 