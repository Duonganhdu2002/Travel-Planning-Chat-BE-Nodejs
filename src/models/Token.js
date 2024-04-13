// models/Token.js
const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    token: { type: String, required: true },
    expiresIn: { type: Date, required: true }
});

module.exports = mongoose.model('Token', tokenSchema);
