const redis = require('redis');
const redisUrl = 'redis://127.0.0.1:6379';
module.exports = redis.createClient(redisUrl);