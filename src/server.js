const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth.route");
const userRoutes = require("./routes/user.route");
const messageRoutes = require("./routes/message.route");
const http = require("http");
const { Server } = require("socket.io");
const User = require("./models/user.model");

const app = express();

app.use(cors({ origin: "http://localhost:8081" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

authRoutes(app);
userRoutes(app);
messageRoutes(app);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the application." });
});

const port = process.env.PORT || 8080;

mongoose
  .connect(
    "mongodb+srv://2154810104:O1hjKUouTN2XHeiO@wydanhdu.ilbkii2.mongodb.net/travel_app?retryWrites=true&w=majority&appName=wydanhdu",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB");
    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: "http://localhost:8081",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("A user connected");

      socket.on("join", (userId) => {
        socket.join(userId);
        console.log(`User with ID ${userId} joined room ${userId}`);
      });

      socket.on("send_friend_request", async (data) => {
        const { senderId, receiverId } = data;

        try {
          const sender = await User.findById(senderId);
          const receiver = await User.findById(receiverId);

          if (sender && receiver) {
            receiver.waiting_list.push(sender._id);
            sender.invite_list.push(receiver._id);

            await receiver.save();
            await sender.save();

            io.to(receiverId).emit("receive_friend_request", {
              senderId: sender._id,
              senderUsername: sender.username,
            });
          }
        } catch (error) {
          console.error("Error sending friend request:", error);
          socket.emit('friend_request_failed', { error: 'Error sending friend request' });
        }
      });

      socket.on("accept_friend_request", async (data) => {
        const { senderId, receiverId } = data;

        try {
          const sender = await User.findById(senderId);
          const receiver = await User.findById(receiverId);

          if (sender && receiver) {
            sender.list_friend.push(receiver._id);
            receiver.list_friend.push(sender._id);

            receiver.waiting_list = receiver.waiting_list.filter(
              (id) => id.toString() !== sender._id.toString()
            );
            sender.invite_list = sender.invite_list.filter(
              (id) => id.toString() !== receiver._id.toString()
            );

            await sender.save();
            await receiver.save();

            io.to(senderId).emit("friend_request_accepted", { receiverId });
          }
        } catch (error) {
          console.error("Error accepting friend request:", error);
        }
      });

      socket.on("reject_friend_request", async (data) => {
        const { senderId, receiverId } = data;

        try {
          const sender = await User.findById(senderId);
          const receiver = await User.findById(receiverId);

          if (sender && receiver) {
            receiver.waiting_list = receiver.waiting_list.filter(
              (id) => id.toString() !== sender._id.toString()
            );
            sender.invite_list = sender.invite_list.filter(
              (id) => id.toString() !== receiver._id.toString()
            );

            await sender.save();
            await receiver.save();
          }
        } catch (error) {
          console.error("Error rejecting friend request:", error);
        }
      });

      socket.on("disconnect", () => {
        console.log("A user disconnected");
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
