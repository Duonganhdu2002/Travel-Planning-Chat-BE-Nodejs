const controller = require("../controllers/province.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Route to get all provinces
  app.get("/api/provinces/get-all-province", controller.getAllProvinces);

  // Route to get provinces by country ID
  app.get("/api/provinces/:countryId", controller.getProvincesByCountryId);

  // Route to add a new province
  app.post("/api/provinces", controller.addProvince);

  // Route to update a province
  app.put("/api/provinces/:id", controller.updateProvince);

  // Route to delete a province
  app.delete("/api/provinces/:id", controller.deleteProvince);
};
