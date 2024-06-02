const Country = require('../models/country.model'); // Adjust the path if needed

// Controller function to get all countries
const getAllCountries = async (req, res) => {
  try {
    const countries = await Country.find({});
    res.status(200).json(countries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching countries', error });
  }
};

module.exports = {
  getAllCountries,
};
