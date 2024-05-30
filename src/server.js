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
const User = require("./models/user.model");

const app = express();

app.use(cors({ origin: "http://localhost:8081" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

authRoutes(app);
userRoutes(app);
messageRoutes(app);
notificationRoutes(app);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the application." });
});

const port = process.env.PORT || 8080;

mongoose.connect(process.env.MONGO_URI, {
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

  app.set('io', io);

  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("join", async (userId) => {
      socket.join(userId);
      console.log(`User with ID ${userId} joined room`);

      try {
        const user = await User.findById(userId);
        const friendRequests = await User.find({
          _id: { $in: user.waiting_list }
        }, 'id username');
        
        console.log(`Initial friend requests for user ${userId}:`, friendRequests);
        socket.emit('initial_friend_requests', friendRequests);
      } catch (error) {
        console.error(error);
        socket.emit("ERROR", { message: "Failed to fetch friend requests" });
      }
    });

    socket.on("send_friend_request", async ({ senderId, receiverId, username }) => {
      try {
        console.log(`Received friend request from ${senderId} to ${receiverId} (${username})`);
        const toUser = await User.findById(receiverId);
        if (!toUser) {
          console.error(`User with ID ${receiverId} not found`);
          return socket.emit("ERROR", { message: "User not found" });
        }
        console.log(`Found user: ${toUser.username}`);
        toUser.waiting_list.push(senderId);
        await toUser.save();

        io.to(receiverId).emit("receive_friend_request", { senderId, username });
      } catch (error) {
        console.error(`Failed to send friend request: ${error}`);
        socket.emit("ERROR", { message: "Failed to send friend request" });
      }
    });

    socket.on("accept_friend_request", async ({ userId, friendId }) => {
      try {
        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
          console.error("User not found.");
          return socket.emit("ERROR", { message: "User not found." });
        }

        user.list_friend.push(friendId);
        friend.list_friend.push(userId);

        user.waiting_list = user.waiting_list.filter(id => id.toString() !== friendId);
        friend.invite_list = friend.invite_list.filter(id => id.toString() !== userId);

        await user.save();
        await friend.save();

        console.log(`Friend request accepted between ${userId} and ${friendId}`);
        io.to(friendId).emit('friend_request_accepted', { userId, friendId });
        io.to(userId).emit('friend_request_accepted', { userId, friendId });

        socket.emit('SUCCESS', { message: 'Friend request accepted.' });
      } catch (error) {
        console.error(error);
        socket.emit('ERROR', { message: 'Failed to accept friend request.' });
      }
    });

    socket.on("reject_friend_request", async ({ userId, friendId }) => {
      try {
        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
          console.error("User not found.");
          return socket.emit("ERROR", { message: "User not found." });
        }

        user.waiting_list = user.waiting_list.filter(id => id.toString() !== friendId);
        friend.invite_list = friend.invite_list.filter(id => id.toString() !== userId);

        await user.save();
        await friend.save();

        console.log(`Friend request rejected between ${userId} and ${friendId}`);
        io.to(friendId).emit('friend_request_rejected', { userId, friendId });
        io.to(userId).emit('friend_request_rejected', { userId, friendId });

        socket.emit('SUCCESS', { message: 'Friend request rejected.' });
      } catch (error) {
        console.error(error);
        socket.emit('ERROR', { message: 'Failed to reject friend request.' });
      }
    });

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
