const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AuthController = require('../../src/controllers/authController');
const UserService = require('../../src/services/userService');
const { Tenant } = require('../../src/models');

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../src/services/userService');
jest.mock('../../src/models');

describe('AuthController', () => {
  let mockReq;
  let mockRes;
  let mockJson;
  let mockStatus;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup mock response
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockRes = {
      status: mockStatus,
      json: mockJson
    };
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        tenantName: 'Test Tenant'
      };
      
      mockReq = { body: userData };
      
      // Mock service responses
      UserService.findByEmail.mockResolvedValue(null);
      UserService.createUser.mockResolvedValue({
        id: 1,
        username: userData.username,
        email: userData.email,
        role: 'user',
        tenant_id: 1
      });
      
      Tenant.create.mockResolvedValue({ id: 1, name: userData.tenantName });
      bcrypt.hash.mockResolvedValue('hashedPassword');
      jwt.sign.mockReturnValue('mock-jwt-token');

      // Act
      await AuthController.register(mockReq, mockRes);

      // Assert
      expect(UserService.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(Tenant.create).toHaveBeenCalledWith({ name: userData.tenantName });
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(UserService.createUser).toHaveBeenCalledWith({
        username: userData.username,
        email: userData.email,
        password: 'hashedPassword',
        tenant_id: 1,
        role: 'user'
      });
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 1, email: userData.email, role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'User registered successfully',
        token: 'mock-jwt-token',
        user: {
          id: 1,
          username: userData.username,
          email: userData.email,
          role: 'user',
          tenant_id: 1
        }
      });
    });

    it('should return error if user already exists', async () => {
      // Arrange
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      
      mockReq = { body: userData };
      UserService.findByEmail.mockResolvedValue({ id: 1, email: userData.email });

      // Act
      await AuthController.register(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'User already exists' });
      expect(UserService.createUser).not.toHaveBeenCalled();
    });

    it('should handle missing JWT_SECRET', async () => {
      // Arrange
      const originalJwtSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;
      
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        tenantName: 'Test Tenant'
      };
      
      mockReq = { body: userData };
      UserService.findByEmail.mockResolvedValue(null);
      Tenant.create.mockResolvedValue({ id: 1, name: userData.tenantName });
      bcrypt.hash.mockResolvedValue('hashedPassword');
      UserService.createUser.mockResolvedValue({
        id: 1,
        username: userData.username,
        email: userData.email,
        role: 'user',
        tenant_id: 1
      });

      // Act
      await AuthController.register(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Server misconfiguration: JWT secret missing.'
      });

      // Restore environment variable
      process.env.JWT_SECRET = originalJwtSecret;
    });

    it('should handle registration errors', async () => {
      // Arrange
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      
      mockReq = { body: userData };
      UserService.findByEmail.mockRejectedValue(new Error('Database error'));

      // Act
      await AuthController.register(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Registration failed',
        details: 'Database error'
      });
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      mockReq = { body: loginData };
      
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: loginData.email,
        password: 'hashedPassword',
        role: 'user',
        tenant_id: 1
      };
      
      UserService.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mock-jwt-token');

      // Act
      await AuthController.login(mockReq, mockRes);

      // Assert
      expect(UserService.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.password);
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: mockUser.id, email: mockUser.email, role: mockUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Login successful',
        token: 'mock-jwt-token',
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
          role: mockUser.role,
          tenant_id: mockUser.tenant_id
        }
      });
    });

    it('should return error for invalid email', async () => {
      // Arrange
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };
      
      mockReq = { body: loginData };
      UserService.findByEmail.mockResolvedValue(null);

      // Act
      await AuthController.login(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid credentials' });
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return error for invalid password', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      
      mockReq = { body: loginData };
      
      const mockUser = {
        id: 1,
        email: loginData.email,
        password: 'hashedPassword',
        role: 'user'
      };
      
      UserService.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      // Act
      await AuthController.login(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid credentials' });
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should handle login errors', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      mockReq = { body: loginData };
      UserService.findByEmail.mockRejectedValue(new Error('Database error'));

      // Act
      await AuthController.login(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Login failed' });
    });
  });

  describe('getProfile', () => {
    it('should return user profile without password', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
        tenant_id: 1,
        dataValues: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          password: 'hashedPassword',
          role: 'user',
          tenant_id: 1
        }
      };
      
      mockReq = { user: { id: 1 } };
      UserService.findById.mockResolvedValue(mockUser);

      // Act
      await AuthController.getProfile(mockReq, mockRes);

      // Assert
      expect(UserService.findById).toHaveBeenCalledWith(1);
      expect(mockJson).toHaveBeenCalledWith(mockUser);
      expect(mockUser.dataValues.password).toBeUndefined();
    });

    it('should handle profile retrieval errors', async () => {
      // Arrange
      mockReq = { user: { id: 1 } };
      UserService.findById.mockRejectedValue(new Error('Database error'));

      // Act
      await AuthController.getProfile(mockReq, mockRes);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Failed to get profile' });
    });
  });
}); 