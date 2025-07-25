// backend/tests/testConnection.js
require('dotenv').config();
const { Sequelize } = require('sequelize');

// Load config
const config = require('../config/config.js');
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Initialize Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: false, // Optional: disables SQL query logging
  }
);

// Test connection
sequelize.authenticate()
  .then(() => {
    console.log('✅ Connection has been established successfully.');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Unable to connect to the database:', err);
    process.exit(1);
  });