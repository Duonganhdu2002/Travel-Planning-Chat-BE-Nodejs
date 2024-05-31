const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  
  app.get("/api/conversations/:userId", controller.getConversations);
  app.get("/api/messages/:userId/:friendId", controller.messages);
  app.get("/api/user/friends/:userId", controller.getFriendList);
  app.get("/api/user/all_user", controller.getAllUsers);
  app.get("/api/user/user_detail/:id", controller.getUserById);
  app.post("/api/user/check-friend-status", controller.checkFriendStatus);
  app.post("/api/user/unfriend", controller.unfriend);
  app.post("/api/user/send-friend-request", controller.sendFriendRequest);
  app.post("/api/user/check-wating-list", controller.checkWaitingListStatus);
  app.get("/api/user/waiting_list/:userId", controller.getWaitingList);

  app.get("/api/test/user", [authJwt.verifyToken], controller.userBoard);
  app.patch("/api/test/user_update", controller.updateUser);

  app.get(
    "/api/test/mod",
    [authJwt.verifyToken, authJwt.isModerator],
    controller.moderatorBoard
  );

  app.get(
    "/api/test/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.adminBoard
  );
};
