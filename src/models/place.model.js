const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  name: String,
  address: {
    street: String,
    city_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City' 
    }
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category' 
  },
  description: String,
  location: {
    type: { type: String, default: "Point" },
    coordinates: [Number]
  },
  contact: {
    phone: String,
    website: String
  },
  photos: [String]
});

placeSchema.index({ location: '2dsphere' }); // Tạo chỉ mục địa lý cho trường location

const Place = mongoose.model('Place', placeSchema);

module.exports = Place;
