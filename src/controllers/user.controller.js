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

exports.getUserInfo = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).populate("roles", "-__v");
    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }
    res.status(200).send({
      id: user._id, 
      username: user.username,
      email: user.email,
      roles: user.roles.map((role) => role.name),
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while fetching user info.",
    });
  }
};
