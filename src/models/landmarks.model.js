const mongoose = require('mongoose');

const landmarkSchema = new mongoose.Schema({
  province_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Province' },
  name: String,
  description: String,
  icon: String,
  photos: [String]
});

const Landmark = mongoose.model('Landmark', landmarkSchema);

module.exports = Landmark;
