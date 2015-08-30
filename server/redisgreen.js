var redis = require('redis');
var time = require('moment');
var url = require('url');

var redisgreen = process.env.REDISGREEN_URL ? url.parse(process.env.REDISGREEN_URL) : url.parse(process.env.redisgreen);
var redisClient = redis.createClient(redisgreen.port, redisgreen.hostname);
// redisClient.auth(redisgreen.auth.split(":")[1]);

redisClient.on('connect', function(){
  console.log('connected to RedisGreen.');
});

module.exports = redisClient;