const config = require("../config/auth.config");
require("dotenv").config();
const db = require("../models");
const nodemailer = require("nodemailer");
const User = db.user;
const Role = db.role;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const email = process.env.EMAIL;
const password = process.env.PASSWORD;
const host = process.env.HOST_MAIL;

exports.signup = async (req, res) => {
  try {
    const user = new User({
      id: req.body.id,
      fullname: "",
      username: req.body.username,
      email: req.body.email,
      location: "",
      phone: "",
      password: bcrypt.hashSync(req.body.password, 8),
    });

    await user.save();

    let roles = [];
    if (req.body.roles) {
      roles = await Role.find({ name: { $in: req.body.roles } });
    } else {
      const role = await Role.findOne({ name: "user" });
      roles.push(role);
    }

    user.roles = roles.map((role) => role._id);
    await user.save();

    res.status(201).send({
      message: "Success",
      data: {
        id: user.id,
        username: req.body.username,
        email: req.body.email,
      },
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while registering the user.",
    });
  }
};

async function getRoleNames(roleIds) {
  try {
    // Query roles from database based on IDs
    const roles = await Role.find({ _id: { $in: roleIds } });

    // Extract role names from queried roles
    const roleNames = roles.map(role => role.name);

    return roleNames;
  } catch (error) {
    console.error("Error fetching role names:", error);
    return [];
  }
}


exports.signin = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    }).populate("roles", "-__v");

    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }

    const passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Invalid Password!",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        location: user.location,
        phone: user.phone,
        roles: await getRoleNames(user.roles),
      },
      config.secret,
      {
        algorithm: "HS256",
        allowInsecureKeySizes: true,
        expiresIn: 86400, // 24 hours
      }
    );

    const authorities = user.roles.map(
      (role) => "ROLE_" + role.name.toUpperCase()
    );

    res.status(200).send({
      id: user._id,
      accessToken: token,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while signing in.",
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }
    const newPassword = Math.random().toString(36).slice(-8);
    user.password = bcrypt.hashSync(newPassword, 8);
    await user.save();
    const transporter = nodemailer.createTransport({
      host: host,
      port: 25,
      auth: {
        user: email,
        pass: password,
      },
    });
    const mailOptions = {
      from: "Cineflix support<support@cineflix.com>",
      to: user.email,
      subject: "Wyd Travel Official Reset Password",
      text: `Your new password is: ${newPassword}`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).send({ message: "Failed to send email." });
      } else {
        console.log("Email sent: " + info.response);
        return res
          .status(200)
          .send({ message: `Email sent with new password: ${newPassword}` });
      }
    });
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while processing your request.",
    });
  }
};
