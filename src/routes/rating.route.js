const controller = require('../controllers/rating.controller');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  // Route to get all ratings
  app.get('/api/all-rating', controller.getAllRatings);

  // Route to create a new rating
  app.post('/api/rating', controller.createRating);

  // Route to update a rating
  app.put('/api/rating/:id', controller.updateRating);

  // Route to delete a rating
  app.delete('/api/rating/:id', controller.deleteRating);
};
