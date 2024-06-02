const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/auth.route");
const userRoutes = require("./routes/user.route");
const messageRoutes = require("./routes/message.route");
const notificationRoutes = require("./routes/notification.route");
const countryRoutes = require("./routes/country.route");
const {
  joinHandler,
  sendMessageHandler,
  sendFriendRequestHandler,
  acceptFriendRequestHandler,
  rejectFriendRequestHandler,
  unfriendHandler,
} = require("./services/socketHandlers");
const passport = require("passport");
const session = require("express-session");

const app = express();
//session config
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
}))
//passport config
require("./config/passport")(passport);

app.use(cors({ origin: "http://localhost:8081" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

authRoutes(app);
userRoutes(app);
messageRoutes(app);
notificationRoutes(app);
countryRoutes(app);
//route
app.use("/auth", require("./routes/google.route"));

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the application." });
});

const port = process.env.PORT || 8080;

//passport middleware
app.use(passport.initialize);
app.use(passport.session)

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: "http://localhost:8081",
        methods: ["GET", "POST"],
      },
    });

    app.set("io", io);

    io.on("connection", (socket) => {
      console.log("A user connected");

      socket.on("join", (data) => joinHandler(socket, data));
      socket.on("send_message", (data) => sendMessageHandler(socket, data));
      socket.on("send_friend_request", (data) => sendFriendRequestHandler(socket, data));
      socket.on("accept_friend_request", (data) => acceptFriendRequestHandler(socket, data));
      socket.on("reject_friend_request", (data) => rejectFriendRequestHandler(socket, data));
      socket.on("unfriend", (data) => unfriendHandler(socket, data));

      socket.on("disconnect", () => {
        console.log("User disconnected");
      });
    });

    server.listen(port, "0.0.0.0", () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });

module.exports = app;
