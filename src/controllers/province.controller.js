const Province = require('../models/provinces.model');

// Get all provinces
const getAllProvinces = async (req, res) => {
  try {
    const provinces = await Province.find({});
    res.status(200).json(provinces);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching provinces', error });
  }
};

// Get provinces by country ID
const getProvincesByCountryId = async (req, res) => {
  const { countryId } = req.params;
  try {
    const provinces = await Province.find({ country_id: countryId });
    res.status(200).json(provinces);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching provinces by country ID', error });
  }
};

// Add a new province
const addProvince = async (req, res) => {
  const { country_id, name, description, icon, photos } = req.body;
  try {
    const newProvince = new Province({ country_id, name, description, icon, photos });
    await newProvince.save();
    res.status(201).json(newProvince);
  } catch (error) {
    res.status(500).json({ message: 'Error adding province', error });
  }
};

// Update a province
const updateProvince = async (req, res) => {
  const { id } = req.params;
  const { country_id, name, description, icon, photos } = req.body;
  try {
    const updatedProvince = await Province.findByIdAndUpdate(
      id,
      { country_id, name, description, icon, photos },
      { new: true }
    );
    res.status(200).json(updatedProvince);
  } catch (error) {
    res.status(500).json({ message: 'Error updating province', error });
  }
};

// Delete a province
const deleteProvince = async (req, res) => {
  const { id } = req.params;
  try {
    await Province.findByIdAndDelete(id);
    res.status(200).json({ message: 'Province deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting province', error });
  }
};

module.exports = {
  getAllProvinces,
  getProvincesByCountryId,
  addProvince,
  updateProvince,
  deleteProvince,
};
