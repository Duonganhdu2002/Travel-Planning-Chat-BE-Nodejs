const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: Number,
  comment: String,
  place_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Place' }
});

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
