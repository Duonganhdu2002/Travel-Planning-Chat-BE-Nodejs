const Rating = require('../models/ratings.model');
// Function to get all ratings
exports.getAllRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({}).populate('user_id').populate('place_id');
    console.log('Ratings fetched:', ratings); // Add this line
    res.status(200).json(ratings);
  } catch (error) {
    console.error('Error fetching ratings:', error); // Add this line
    res.status(500).json({ message: 'Error fetching ratings', error });
  }
};

// Function to create a new rating
exports.createRating = async (req, res) => {
  const { user_id, rating, comment, place_id } = req.body;

  const newRating = new Rating({
    user_id,
    rating,
    comment,
    place_id,
  });

  try {
    const savedRating = await newRating.save();
    res.status(201).json(savedRating);
  } catch (error) {
    res.status(400).json({ message: 'Error creating rating', error });
  }
};

// Function to update a rating
exports.updateRating = async (req, res) => {
  const { id } = req.params;
  const { user_id, rating, comment, place_id } = req.body;

  try {
    const updatedRating = await Rating.findByIdAndUpdate(
      id,
      { user_id, rating, comment, place_id },
      { new: true }
    );

    if (!updatedRating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    res.status(200).json(updatedRating);
  } catch (error) {
    res.status(400).json({ message: 'Error updating rating', error });
  }
};

// Function to delete a rating
exports.deleteRating = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedRating = await Rating.findByIdAndDelete(id);

    if (!deletedRating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    res.status(200).json({ message: 'Rating deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting rating', error });
  }
};