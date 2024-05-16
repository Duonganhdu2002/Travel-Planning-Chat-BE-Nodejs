const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: String,
  country_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country' 
  },
  description: String,
  photo: String
});

const City = mongoose.model('City', citySchema);

module.exports = City;
