const controller = require('../controllers/landmark.controller'); // Adjust the path as necessary

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  // Route to get all landmarks
  app.get('/api/landmarks/get-all', controller.getAllLandmarks);

  // Route to get landmarks by province ID
  app.get('/api/landmarks/province/:provinceId', controller.getLandmarksByProvinceId);

  // Route to get landmarks by country ID
  app.get('/api/landmarks/country/:countryId', controller.getLandmarksByCountryId);

  // Route to add a new landmark
  app.post('/api/landmarks', controller.addLandmark);

  // Route to update a landmark
  app.put('/api/landmarks/:id', controller.updateLandmark);

  // Route to delete a landmark
  app.delete('/api/landmarks/:id', controller.deleteLandmark);
};
