const controller = require("../controllers/category.controller"); 

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Route thêm mới category
  app.post("/api/categories", controller.addCategory);

  // Route cập nhật category
  app.put("/api/categories/:id", controller.updateCategory);

  // Route xóa category
  app.delete("/api/categories/:id", controller.deleteCategory);
};
