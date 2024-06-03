const Rating = require('../models/ratings.model');

exports.getAllRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({});
    res.status(200).json(ratings);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
