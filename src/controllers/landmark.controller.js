const Landmark = require('../models/landmarks.model'); 

// Get all landmarks
exports.getAllLandmarks = async (req, res) => {
  try {
    const landmarks = await Landmark.find().populate('province_id');
    res.status(200).json(landmarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get landmarks by province ID
exports.getLandmarksByProvinceId = async (req, res) => {
  try {
    const { provinceId } = req.params;
    const landmarks = await Landmark.find({ province_id: provinceId }).populate('province_id');
    res.status(200).json(landmarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get landmarks by country ID
exports.getLandmarksByCountryId = async (req, res) => {
  try {
    const { countryId } = req.params;
    const landmarks = await Landmark.find().populate({
      path: 'province_id',
      match: { country_id: countryId }
    });
    res.status(200).json(landmarks.filter(landmark => landmark.province_id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new landmark
exports.addLandmark = async (req, res) => {
  try {
    const newLandmark = new Landmark(req.body);
    const savedLandmark = await newLandmark.save();
    res.status(201).json(savedLandmark);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a landmark
exports.updateLandmark = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedLandmark = await Landmark.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updatedLandmark);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a landmark
exports.deleteLandmark = async (req, res) => {
  try {
    const { id } = req.params;
    await Landmark.findByIdAndDelete(id);
    res.status(204).json({ message: 'Landmark deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
