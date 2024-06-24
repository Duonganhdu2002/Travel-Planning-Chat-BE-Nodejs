const config = require("../config/auth.config");
require("dotenv").config();
const db = require("../models");
const nodemailer = require("nodemailer");
const User = db.user;
const Role = db.role;
const Otp = require("../models/otp.model");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const email = process.env.EMAIL;
const password = process.env.PASSWORD;
const host = process.env.HOST_MAIL;
const OTP_EXPIRATION_TIME = 300000; // 5 minutes

// Temporary storage for user details before OTP verification
let tempUserStorage = {};

exports.signup = async (req, res) => {
  try {
    const user = {
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
    };

    const otp = Math.floor(1000 + Math.random() * 9000);
    const otpExpiration = Date.now() + OTP_EXPIRATION_TIME;

    await Otp.findOneAndUpdate(
      { email: user.email },
      { otp: otp, expiration: otpExpiration },
      { upsert: true, new: true }
    );

    tempUserStorage[user.email] = user;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: email,
        pass: password,
      },
    });

    const mailOptions = {
      from: "Travel App Support <support@travelapp.com>",
      to: user.email,
      subject: "OTP Verification for Signup",
      text: `Your OTP for signup is: ${otp}. This OTP is valid for 5 minutes.`,
    };

    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).send({ message: "Failed to send email.", error: error.message });
      } else {
        console.log("Email sent: " + info.response);
        res.status(200).send({
          message: "OTP sent to email. Please verify to complete registration.",
          data: { email: user.email },
        });
      }
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while registering the user.",
    });
  }
};

exports.verifySignupOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await Otp.findOne({ email: email });

    if (!otpRecord) {
      return res.status(400).send({ message: "OTP not found." });
    }

    if (otpRecord.otp !== parseInt(otp, 10)) {
      return res.status(400).send({ message: "Invalid OTP." });
    }

    if (otpRecord.expiration < Date.now()) {
      return res.status(400).send({ message: "OTP expired." });
    }

    const user = tempUserStorage[email];

    if (!user) {
      return res.status(400).send({ message: "User data not found." });
    }

    const newUser = new User({
      username: user.username,
      email: user.email,
      password: user.password,
      avatar: "User_img.png"
    });

    await newUser.save();

    delete tempUserStorage[email]; // Clear temporary storage

    res.status(200).send({
      message: "User registered successfully.",
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while verifying OTP.",
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    const newPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = bcrypt.hashSync(newPassword, 8);

    user.password = hashedPassword;
    await user.save();

    const transporter = nodemailer.createTransport({
      host: host,
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: email,
        pass: password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: "Travel App Support <support@travelapp.com>",
      to: user.email,
      subject: "Password Reset Confirmation",
      text: `Your password has been reset successfully. Your new password is: ${newPassword}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).send({ message: "Failed to send email.", error: error.message });
      } else {
        console.log("Email sent: " + info.response);
        return res.status(200).send({ message: "Password reset successfully and email sent." });
      }
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while resetting the password.",
    });
  }
};

async function getRoleNames(roleIds) {
  try {
    // Query roles from database based on IDs
    const roles = await Role.find({ _id: { $in: roleIds } });

    // Extract role names from queried roles
    const roleNames = roles.map((role) => role.name);

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
        username: user.username,
        email: user.email,
        location: user.location,
        phone: user.phone,
        avatar: user.avatar,
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
