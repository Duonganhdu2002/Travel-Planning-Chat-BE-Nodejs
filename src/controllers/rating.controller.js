const Rating = require('../models/ratings.model');

exports.getAllRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({});
    res.json(ratings);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};