const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth.route"); // Import auth routes
const userRoutes = require("./routes/user.route"); // Import user routes
const messageRoutes = require("./routes/message.route"); // Import message routes
const http = require("http"); // Import http module
const { Server } = require("socket.io"); // Import socket.io module

const app = express(); // Create Express app

app.use(cors({ origin: "http://localhost:8081" }));
app.use(express.json()); // parse requests of content-type - application/json
app.use(express.urlencoded({ extended: true })); // parse requests of content-type - application/x-www-form-urlencoded

// Routes
authRoutes(app);
userRoutes(app);
messageRoutes(app);

// Simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the application." });
});

// set port, listen for requests
const port = process.env.PORT || 8080;

// Connect to the database and start the server
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
    const server = http.createServer(app); // Create HTTP server
    const io = new Server(server, {
      cors: {
        origin: "http://localhost:8081",
        methods: ["GET", "POST"],
      },
    }); // Initialize socket.io

    // WebSocket.io logic
    io.on("connection", (socket) => {
      console.log("A user connected");

      // Handle incoming messages
      socket.on("message", (data) => {
        console.log("Message received:", data);

        // Broadcast the message to all connected clients
        io.emit("message", data);
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log("A user disconnected");
      });
    });

    server.listen(port, "0.0.0.0", () => {
      // Use server to listen for requests
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });

module.exports = app; // Export Express app
