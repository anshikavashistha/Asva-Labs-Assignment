const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserService = require('../services/userService');
const { Tenant } = require('../models');

class AuthController {
  static async register(req, res) {
    try {
      const { username, email, password, tenantName } = req.body;
      console.log('Register request:', req.body);

      // Check if user already exists
      const existingUser = await UserService.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Create tenant if provided
      let tenant;
      if (tenantName) {
        tenant = await Tenant.create({ name: tenantName });
        console.log('Created new tenant:', tenant.id);
      }

      // If no tenantName, check if tenant_id 1 exists
      let tenantId;
      if (!tenant) {
        const defaultTenant = await Tenant.findByPk(1);
        if (!defaultTenant) {
          return res.status(400).json({ error: 'No tenantName provided and default tenant does not exist. Please provide a tenantName.' });
        }
        tenantId = 1;
        console.log('Using default tenant id 1');
      } else {
        tenantId = tenant.id;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Password hashed');

      // Create user
      const user = await UserService.createUser({
        username,
        email,
        password: hashedPassword,
        tenant_id: tenantId,
        role: 'user' // Default role
      });
      console.log('User created:', user.id);

      // Check JWT secret
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not set in environment variables.');
        return res.status(500).json({ error: 'Server misconfiguration: JWT secret missing.' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          tenant_id: user.tenant_id
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed', details: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await UserService.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          tenant_id: user.tenant_id
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  static async getProfile(req, res) {
    try {
      const user = await UserService.findById(req.user.id);
      if (user) {
        delete user.dataValues.password;
      }
      res.json(user);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  }
}

module.exports = AuthController; 