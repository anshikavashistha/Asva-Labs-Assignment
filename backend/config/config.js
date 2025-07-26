require('dotenv').config();

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: './database.sqlite'
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:'
  },
  production: {
    dialect: 'sqlite',
    storage: './database.sqlite'
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },
  kafka: {
    clientId: 'my-app',
    broker: process.env.KAFKA_BROKER || 'localhost:9092'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key'
  },
  server: {
    port: process.env.PORT || 3000
  }
};