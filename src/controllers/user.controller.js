const User = require("../models/user.model");

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};

exports.getAllUsers = (req, res) => {
  User.find({}, "-password")
    .then((users) => {
      res.status(200).send(users);
    })
    .catch((err) => {
      res.status(500).send({ message: "Error retrieving users.", error: err });
    });
};

exports.getUserById = (req, res) => {
  const userId = req.params.id; // Lấy userId từ request parameters

  User.findById(userId, "-password") // Tìm người dùng trong database dựa trên userId, loại bỏ trường password
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User not found." });
      }
      res.status(200).send(user); // Trả về thông tin chi tiết của người dùng
    })
    .catch((err) => {
      res.status(500).send({ message: "Error retrieving user.", error: err });
    });
};

exports.updateUser = (req, res) => {
  const userId = req.body.id;
  const updateData = req.body;

  User.findByIdAndUpdate(userId, updateData, { new: true })
    .then((updatedUser) => {
      if (!updatedUser) {
        return res.status(404).send({ message: "User not found." });
      }
      res
        .status(200)
        .send({ message: "User updated successfully.", user: updatedUser });
    })
    .catch((err) => {
      res.status(500).send({ message: "Error updating user.", error: err });
    });
};
