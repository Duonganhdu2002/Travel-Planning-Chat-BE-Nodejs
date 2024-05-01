const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const Role = require("./models/role.model"); // Import Role model
const authRoutes = require("./routes/auth.route"); // Import auth routes
const userRoutes = require("./routes/user.route"); // Import user routes

const app = express();

var corsOptions = {
  origin: "http://localhost:8081",
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Routes
authRoutes(app);
userRoutes(app);

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
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
    console.log("Connected");
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
      initial();
    });
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
    process.exit(1);
  });

async function initial() {
  try {
    const count = await Role.estimatedDocumentCount();
    if (count === 0) {
      await Promise.all([
        new Role({ name: "user" }).save(),
        new Role({ name: "moderator" }).save(),
        new Role({ name: "admin" }).save(),
      ]);
      console.log("Roles initialized successfully.");
    }
  } catch (error) {
    console.error("Error initializing roles:", error);
  }
}
