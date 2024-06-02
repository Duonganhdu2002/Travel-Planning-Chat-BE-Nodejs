const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  name: String,
  address: {
    street: String,
    ward: String,
    district: String,
    landmark_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Landmark' },
    province_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Province' },
    country_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' }
  },
  description: String,
  photos: [String],
});

const Place = mongoose.model('Place', placeSchema);

module.exports = Place;
