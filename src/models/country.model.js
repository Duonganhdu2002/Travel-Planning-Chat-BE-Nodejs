const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
  name: String,
  currency: String,
  languages: [String],
  icon: String,
  photos: [String]
});

const Country = mongoose.model('Country', countrySchema);

module.exports = Country;
