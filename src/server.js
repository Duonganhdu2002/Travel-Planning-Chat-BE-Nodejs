const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json())
const port = process.env.PORT || 3000;

const exampleRouter = require("./routes/exampleRouter");
app.use("/", exampleRouter);

// Middleware to handle invalid paths
app.use((req, res, next) => {
  const err = new Error("Invalid path");
  err.status = 404;
  next(err);
});

// Middleware to handle internal errors
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status,
      message: err.message,
    },
  });
  res.status(500).send("Internal server error!");
});

mongoose
  .connect(
    "mongodb+srv://2154810104:O1hjKUouTN2XHeiO@wydanhdu.ilbkii2.mongodb.net/travel_app?retryWrites=true&w=majority&appName=wydanhdu"
  )
  .then(() => {
    console.log("Connected");
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  })
  .catch(() => {
    console.log("Can not connect to database");
  });
