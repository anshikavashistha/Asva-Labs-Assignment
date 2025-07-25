const { Sequelize } = require('sequelize');
const dbConfig = require('../../config/config.js');

const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

const sequelize = new Sequelize({
  dialect: config.dialect,
  storage: config.storage
});

module.exports = sequelize;
