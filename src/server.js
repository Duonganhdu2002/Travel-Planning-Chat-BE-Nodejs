const express = require("express");
const mongoose = require("mongoose");
const cron = require("node-cron");
require("dotenv").config();

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

const tokenUtils = require("./untils/tokenUtils");
const authRoutes = require("./routes/auth");
const authenticate = require("./middleware/authenticate");

// Middleware để xóa token hết hạn mỗi phút
cron.schedule("* * * * *", () => {
  tokenUtils.deleteExpiredTokens();
});

// Route handlers
app.use("/auth", authRoutes);

app.get("/protected", authenticate, (req, res) => {
  res.send("This is a protected route");
});

// Middleware xử lý lỗi không xác định và lỗi đường dẫn không hợp lệ
app.use((req, res, next) => {
  const err = new Error("Invalid path");
  err.status = 404;
  next(err);
});

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

// Kết nối cơ sở dữ liệu và khởi động server
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
