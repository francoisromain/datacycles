var bodyParser  = require('body-parser');
var helpers = require('./helpers.js');

module.exports = function (app, express) {

  var redisRouter = express.Router();
  var mlRouter = express.Router();
  var loaderioRouter = express.Router();

  app.use(express.static('client/dist/'));

  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());

  app.use('/api/redis', redisRouter);
  app.use('/api/ml', mlRouter);
  app.use('/loaderio-a45c17137e179e372517a4677fbdb1e5', loaderioRouter);

  app.use(helpers.errorLogger);
  app.use(helpers.errorHandler);

  app.get('*', function (req, res) {
    res.send('404 File Not Found!', 404);
  });

  require('../routes/redisRoute.js')(redisRouter);
  require('../routes/mlRoutes.js')(mlRouter);
  require('../routes/loaderioRoute.js')(loaderioRouter);
};