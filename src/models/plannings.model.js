const mongoose = require('mongoose');

const planningSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  place_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Place' },
  day_start: Date,
  day_end: Date,
  fund: Number,
  plan_owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  public: Boolean,
  name: String
});

const Planning = mongoose.model('Planning', planningSchema);

module.exports = Planning;
