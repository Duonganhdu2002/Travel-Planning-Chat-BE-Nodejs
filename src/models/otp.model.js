const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const otpSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  otp: {
    type: String,
    required: true
  },
  expiration: {
    type: Date,
    required: true
  }
});

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;