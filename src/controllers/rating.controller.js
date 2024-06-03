const Rating = require('../models/ratings.model');

// Function to get all ratings
exports.getAllRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({});
    res.json(ratings);
  } catch (error) {
    res.status(400).json({ message: 'Error deleting rating', error });
  }
};
