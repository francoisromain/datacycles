var redisController = require('./redisController.js');

module.exports = function (app) {
  app.get('/', redisController.get);
  app.get('/trips', redisController.trips);
};
