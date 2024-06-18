const controller = require("../controllers/planning.controller"); 

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  //Route tìm kiếm địa điểm
  app.post("/api/plan/add", controller.createPlanning);
  app.get("/api/plan/get-all", controller.getPlannings);
};
