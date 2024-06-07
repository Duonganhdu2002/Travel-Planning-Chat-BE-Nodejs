const controller = require("../controllers/places.controller"); // Đảm bảo đường dẫn đúng

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Route lấy ra tất cả place
  app.get("/api/places", controller.getAllPlaces);

  // Route lấy ra place dựa trên category id
  app.get("/api/places/category/:categoryId", controller.getPlacesByCategoryId);

  // Route lấy ra place dựa trên landmark id
  app.get("/api/places/landmark/:landmarkId", controller.getPlacesByLandmarkId);

  // Route lấy ra place dựa trên province id
  app.get("/api/places/province/:provinceId", controller.getPlacesByProvinceId);

  // Route lấy ra place dựa trên country id
  app.get("/api/places/country/:countryId", controller.getPlacesByCountryId);

  // Route thêm mới place
  app.post("/api/places", controller.addPlace);

  // Route cập nhật place
  app.put("/api/places/:id", controller.updatePlace);

  // Route xóa place
  app.delete("/api/places/:id", controller.deletePlace);

  //Route sắp xếp theo trung bình đánh giá giảm dần 
  app.get("/api/places/best-places", controller.getTopRatedPlaces);

  //Route chi tiết 1 địa điểm 
  app.get("/api/places/places-detail/:id", controller.getPlaceDetail);

  //Route tìm kiếm địa điểm
  app.post("/api/places/search", controller.searchPlaces);
};
