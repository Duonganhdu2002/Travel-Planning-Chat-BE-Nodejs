const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  landmark_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Landmark' },
  name: String,
  description: String,
  photos: [String]
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
