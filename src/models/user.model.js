const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    avatar: String,
    email: { type: String, required: true },
    password: { type: String, required: true },
    fullname: String,
    location: String,
    phone: String,
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
      },
    ],
  })
);

module.exports = User;
