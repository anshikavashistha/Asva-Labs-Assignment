const jwt = require('jsonwebtoken');
const { authenticateToken, requireRole } = require('../../src/middlewares/auth');
const { User } = require('../../src/models');

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../src/models');

describe('Auth Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup mock request, response, and next function
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token successfully', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'user'
      };
      
      const mockDecoded = {
        userId: 1,
        email: 'test@example.com',
        role: 'user'
      };
      
      mockReq.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockReturnValue(mockDecoded);
      User.findByPk.mockResolvedValue(mockUser);

      // Act
      await authenticateToken(mockReq, mockRes, mockNext);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET);
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(mockReq.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 when no token provided', async () => {
      // Arrange
      mockReq.headers.authorization = undefined;

      // Act
      await authenticateToken(mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access token required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token format is invalid', async () => {
      // Arrange
      mockReq.headers.authorization = 'InvalidFormat';

      // Act
      await authenticateToken(mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access token required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', async () => {
      // Arrange
      mockReq.headers.authorization = 'Bearer invalid-token';
      const jwtError = new Error('Invalid token');
      jwtError.name = 'JsonWebTokenError';
      jwt.verify.mockImplementation(() => {
        throw jwtError;
      });

      // Act
      await authenticateToken(mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is expired', async () => {
      // Arrange
      mockReq.headers.authorization = 'Bearer expired-token';
      const jwtError = new Error('Token expired');
      jwtError.name = 'TokenExpiredError';
      jwt.verify.mockImplementation(() => {
        throw jwtError;
      });

      // Act
      await authenticateToken(mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Token expired' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when user not found', async () => {
      // Arrange
      const mockDecoded = {
        userId: 999,
        email: 'test@example.com',
        role: 'user'
      };
      
      mockReq.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockReturnValue(mockDecoded);
      User.findByPk.mockResolvedValue(null);

      // Act
      await authenticateToken(mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      // Arrange
      const mockDecoded = {
        userId: 1,
        email: 'test@example.com',
        role: 'user'
      };
      
      mockReq.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockReturnValue(mockDecoded);
      User.findByPk.mockRejectedValue(new Error('Database error'));

      // Act
      await authenticateToken(mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Authentication error' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle other JWT errors', async () => {
      // Arrange
      mockReq.headers.authorization = 'Bearer valid-token';
      const jwtError = new Error('Other JWT error');
      jwtError.name = 'OtherError';
      jwt.verify.mockImplementation(() => {
        throw jwtError;
      });

      // Act
      await authenticateToken(mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Authentication error' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('should allow access for user with required role', () => {
      // Arrange
      const roles = ['admin', 'user'];
      mockReq.user = { id: 1, role: 'admin' };
      const middleware = requireRole(roles);

      // Act
      middleware(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow access for user with one of the required roles', () => {
      // Arrange
      const roles = ['admin', 'user'];
      mockReq.user = { id: 1, role: 'user' };
      const middleware = requireRole(roles);

      // Act
      middleware(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 when no user is authenticated', () => {
      // Arrange
      const roles = ['admin'];
      mockReq.user = undefined;
      const middleware = requireRole(roles);

      // Act
      middleware(mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Authentication required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when user role is not in required roles', () => {
      // Arrange
      const roles = ['admin'];
      mockReq.user = { id: 1, role: 'user' };
      const middleware = requireRole(roles);

      // Act
      middleware(mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should work with single role requirement', () => {
      // Arrange
      const roles = ['admin'];
      mockReq.user = { id: 1, role: 'admin' };
      const middleware = requireRole(roles);

      // Act
      middleware(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access for user with different role than required', () => {
      // Arrange
      const roles = ['admin'];
      mockReq.user = { id: 1, role: 'user' };
      const middleware = requireRole(roles);

      // Act
      middleware(mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
}); 