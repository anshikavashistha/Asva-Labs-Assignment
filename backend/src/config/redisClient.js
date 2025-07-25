require('dotenv').config();

const { createClient } = require('redis');
const config = require('./appConfig');

const redisClient = createClient({
  url: config.redis.url
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
  await redisClient.connect();
  console.log('Connected to Redis');
})();

module.exports = redisClient;