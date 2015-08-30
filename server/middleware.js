var bodyParser  = require('body-parser');
var helpers = require('./helpers.js');

module.exports = function (app, express) {

  var redisRouter = express.Router();

  app.use(express.static('client/dist/'));

  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());

  app.use('/api/redis', redisRouter);

  app.use(helpers.errorLogger);
  app.use(helpers.errorHandler);

  app.get('*', function (req, res) {
    res.send('404 File Not Found!', 404);
  });

  require('./redisRoute.js')(redisRouter);
};