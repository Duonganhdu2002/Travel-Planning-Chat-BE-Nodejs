const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
  name: String,
  code: String,
  currency: String,
  languages: [String],
  photo: String
});

const Country = mongoose.model('Country', countrySchema);

module.exports = Country;
