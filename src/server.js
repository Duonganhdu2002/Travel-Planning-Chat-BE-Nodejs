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
    process.env.MONGO_URI,
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

    // WebSocket logic
    io.on("connection", (socket) => {
      console.log("a user connected");

      socket.on("send_friend_request", ({ senderId, receiverId, username }) => {
        // Emit event to the receiver
        io.to(receiverId).emit("receive_friend_request", { senderId, username });
      });

      socket.on("disconnect", () => {
        console.log("user disconnected");
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
