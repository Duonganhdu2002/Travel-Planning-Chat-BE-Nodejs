const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  avatar: String,
  fullname: String,
  location: String,
  email: { type: String, required: true },
  password: { type: String, required: true },
  phone: String,
  waiting_list: [{ type: mongoose.Schema.Types.ObjectId, ref: "Planning" }],
  list_friend: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  invite_list: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  book_mark_list: [{ type: mongoose.Schema.Types.ObjectId, ref: "Place" }],
  roles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
  ],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
