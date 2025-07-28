const UserService = require('../../src/services/userService');
const { User } = require('../../src/models');

// Mock dependencies
jest.mock('../../src/models');

describe('UserService', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should find user by email successfully', async () => {
      // Arrange
      const email = 'test@example.com';
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: email,
        role: 'user'
      };
      
      User.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await UserService.findByEmail(email);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      User.findOne.mockResolvedValue(null);

      // Act
      const result = await UserService.findByEmail(email);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      // Arrange
      const email = 'test@example.com';
      const error = new Error('Database connection failed');
      User.findOne.mockRejectedValue(error);

      // Act & Assert
      await expect(UserService.findByEmail(email)).rejects.toThrow('Database connection failed');
      expect(User.findOne).toHaveBeenCalledWith({ where: { email } });
    });
  });

  describe('findById', () => {
    it('should find user by id successfully', async () => {
      // Arrange
      const userId = 1;
      const mockUser = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        role: 'user'
      };
      
      User.findByPk.mockResolvedValue(mockUser);

      // Act
      const result = await UserService.findById(userId);

      // Assert
      expect(User.findByPk).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      // Arrange
      const userId = 999;
      User.findByPk.mockResolvedValue(null);

      // Act
      const result = await UserService.findById(userId);

      // Assert
      expect(User.findByPk).toHaveBeenCalledWith(userId);
      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      // Arrange
      const userId = 1;
      const error = new Error('Database connection failed');
      User.findByPk.mockRejectedValue(error);

      // Act & Assert
      await expect(UserService.findById(userId)).rejects.toThrow('Database connection failed');
      expect(User.findByPk).toHaveBeenCalledWith(userId);
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      // Arrange
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'hashedPassword',
        role: 'user',
        tenant_id: 1
      };
      
      const createdUser = {
        id: 2,
        ...userData
      };
      
      User.create.mockResolvedValue(createdUser);

      // Act
      const result = await UserService.createUser(userData);

      // Assert
      expect(User.create).toHaveBeenCalledWith(userData);
      expect(result).toEqual(createdUser);
    });

    it('should handle database errors during creation', async () => {
      // Arrange
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'hashedPassword',
        role: 'user',
        tenant_id: 1
      };
      
      const error = new Error('Validation error');
      User.create.mockRejectedValue(error);

      // Act & Assert
      await expect(UserService.createUser(userData)).rejects.toThrow('Validation error');
      expect(User.create).toHaveBeenCalledWith(userData);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users successfully', async () => {
      // Arrange
      const mockUsers = [
        { id: 1, username: 'user1', email: 'user1@example.com', role: 'user' },
        { id: 2, username: 'user2', email: 'user2@example.com', role: 'admin' }
      ];
      
      User.findAll.mockResolvedValue(mockUsers);

      // Act
      const result = await UserService.getAllUsers();

      // Assert
      expect(User.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array when no users exist', async () => {
      // Arrange
      User.findAll.mockResolvedValue([]);

      // Act
      const result = await UserService.getAllUsers();

      // Assert
      expect(User.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      User.findAll.mockRejectedValue(error);

      // Act & Assert
      await expect(UserService.getAllUsers()).rejects.toThrow('Database connection failed');
      expect(User.findAll).toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      // Arrange
      const userId = 1;
      const updateData = {
        username: 'updateduser',
        email: 'updated@example.com'
      };
      
      const updateResult = [1]; // Sequelize update returns array with affected rows count
      User.update.mockResolvedValue(updateResult);

      // Act
      const result = await UserService.updateUser(userId, updateData);

      // Assert
      expect(User.update).toHaveBeenCalledWith(updateData, { where: { id: userId } });
      expect(result).toEqual(updateResult);
    });

    it('should handle database errors during update', async () => {
      // Arrange
      const userId = 1;
      const updateData = {
        username: 'updateduser',
        email: 'updated@example.com'
      };
      
      const error = new Error('Validation error');
      User.update.mockRejectedValue(error);

      // Act & Assert
      await expect(UserService.updateUser(userId, updateData)).rejects.toThrow('Validation error');
      expect(User.update).toHaveBeenCalledWith(updateData, { where: { id: userId } });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      // Arrange
      const userId = 1;
      const deleteResult = 1; // Sequelize destroy returns affected rows count
      User.destroy.mockResolvedValue(deleteResult);

      // Act
      const result = await UserService.deleteUser(userId);

      // Assert
      expect(User.destroy).toHaveBeenCalledWith({ where: { id: userId } });
      expect(result).toEqual(deleteResult);
    });

    it('should handle database errors during deletion', async () => {
      // Arrange
      const userId = 1;
      const error = new Error('Foreign key constraint');
      User.destroy.mockRejectedValue(error);

      // Act & Assert
      await expect(UserService.deleteUser(userId)).rejects.toThrow('Foreign key constraint');
      expect(User.destroy).toHaveBeenCalledWith({ where: { id: userId } });
    });
  });
}); 