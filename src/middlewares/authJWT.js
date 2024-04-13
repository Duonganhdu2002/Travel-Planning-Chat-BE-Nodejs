const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const Role = db.role;

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!",
      });
    }
    req.userId = decoded.id;
    next();
  });
};
isAdmin = (req, res, next) => {
  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      Role.find({ _id: { $in: user.roles } })
        .then((roles) => {
          const isAdmin = roles.some((role) => role.name === "admin");
          if (isAdmin) {
            next();
          } else {
            res.status(403).send({ message: "Require Admin Role!" });
          }
        })
        .catch((err) => {
          res.status(500).send({
            message: err.message || "Some error occurred while checking roles.",
          });
        });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while finding user.",
      });
    });
};

isModerator = (req, res, next) => {
  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      Role.find({ _id: { $in: user.roles } })
        .then((roles) => {
          const isModerator = roles.some((role) => role.name === "moderator");
          if (isModerator) {
            next();
          } else {
            res.status(403).send({ message: "Require Moderator Role!" });
          }
        })
        .catch((err) => {
          res.status(500).send({
            message: err.message || "Some error occurred while checking roles.",
          });
        });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while finding user.",
      });
    });
};

const authJwt = {
  verifyToken,
  isAdmin,
  isModerator,
};
module.exports = authJwt;
