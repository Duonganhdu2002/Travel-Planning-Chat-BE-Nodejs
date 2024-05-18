const mongoose = require('mongoose');

const provinceSchema = new mongoose.Schema({
  country_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
  name: String,
  description: String,
  icon: String,
  photos: [String]
});

const Province = mongoose.model('Province', provinceSchema);

module.exports = Province;
