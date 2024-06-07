const Place = require('../models/places.model'); // Đảm bảo đường dẫn đúng
const Rating = require('../models/ratings.model'); // Đảm bảo đường dẫn đúng
const Category = require('../models/categories.model');
const Landmark = require('../models/landmarks.model');
const Province = require('../models/provinces.model');
const Country = require('../models/country.model');

// Hàm lấy ra tất cả place
exports.getAllPlaces = async (req, res) => {
  try {
    const places = await Place.find().populate('category_id').populate('address.landmark_id').populate('address.province_id').populate('address.country_id');
    res.status(200).json(places);
  } catch (error) {
    res.status(500).json({ message: 'Error getting places', error });
  }
};

// Hàm lấy ra place dựa trên category id
exports.getPlacesByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const places = await Place.find({ category_id: categoryId }).populate('category_id').populate('address.landmark_id').populate('address.province_id').populate('address.country_id');
    res.status(200).json(places);
  } catch (error) {
    res.status(500).json({ message: 'Error getting places by category ID', error });
  }
};

// Hàm lấy ra place dựa trên landmark id
exports.getPlacesByLandmarkId = async (req, res) => {
  try {
    const { landmarkId } = req.params;
    const places = await Place.find({ 'address.landmark_id': landmarkId }).populate('category_id').populate('address.landmark_id').populate('address.province_id').populate('address.country_id');
    res.status(200).json(places);
  } catch (error) {
    res.status(500).json({ message: 'Error getting places by landmark ID', error });
  }
};

// Hàm lấy ra place dựa trên province id
exports.getPlacesByProvinceId = async (req, res) => {
  try {
    const { provinceId } = req.params;
    const places = await Place.find({ 'address.province_id': provinceId }).populate('category_id').populate('address.landmark_id').populate('address.province_id').populate('address.country_id');
    res.status(200).json(places);
  } catch (error) {
    res.status(500).json({ message: 'Error getting places by province ID', error });
  }
};

// Hàm lấy ra place dựa trên country id
exports.getPlacesByCountryId = async (req, res) => {
  try {
    const { countryId } = req.params;
    const places = await Place.find({ 'address.country_id': countryId }).populate('category_id').populate('address.landmark_id').populate('address.province_id').populate('address.country_id');
    res.status(200).json(places);
  } catch (error) {
    res.status(500).json({ message: 'Error getting places by country ID', error });
  }
};

// Hàm thêm mới một place
exports.addPlace = async (req, res) => {
  try {
    const { category_id, name, address, description, photos } = req.body;
    const newPlace = new Place({
      category_id,
      name,
      address,
      description,
      photos
    });
    const savedPlace = await newPlace.save();
    res.status(201).json(savedPlace);
  } catch (error) {
    res.status(500).json({ message: 'Error adding place', error });
  }
};

// Hàm cập nhật một place
exports.updatePlace = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, name, address, description, photos } = req.body;
    const updatedPlace = await Place.findByIdAndUpdate(
      id,
      { category_id, name, address, description, photos },
      { new: true }
    );
    if (!updatedPlace) {
      return res.status(404).json({ message: 'Place not found' });
    }
    res.status(200).json(updatedPlace);
  } catch (error) {
    res.status(500).json({ message: 'Error updating place', error });
  }
};

// Hàm xóa một place
exports.deletePlace = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPlace = await Place.findByIdAndDelete(id);
    if (!deletedPlace) {
      return res.status(404).json({ message: 'Place not found' });
    }
    res.status(200).json({ message: 'Place deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting place', error });
  }
};

// Hàm lấy danh sách những địa điểm có đánh giá cao nhất
exports.getTopRatedPlaces = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10; 
    const skip = (page - 1) * limit; 

    const topRatedPlaces = await Rating.aggregate([
      {
        $group: {
          _id: "$place_id",
          averageRating: { $avg: "$rating" }
        }
      },
      {
        $project: {
          averageRatingRounded: { $round: ["$averageRating", 1] }
        }
      },
      {
        $sort: { averageRatingRounded: -1 }
      },
      {
        $skip: skip 
      },
      {
        $limit: limit 
      },
      {
        $lookup: {
          from: "places",
          localField: "_id",
          foreignField: "_id",
          as: "place"
        }
      },
      {
        $unwind: "$place"
      },
      {
        $lookup: {
          from: "categories",
          localField: "place.category_id",
          foreignField: "_id",
          as: "category"
        }
      },
      {
        $unwind: "$category"
      },
      {
        $project: {
          _id: 0,
          place_id: "$place._id",
          name: "$place.name",
          category: "$category.name",
          address: "$place.address",
          description: "$place.description",
          photos: "$place.photos",
          averageRating: "$averageRatingRounded"
        }
      }
    ]);

    res.status(200).json(topRatedPlaces);
  } catch (error) {
    res.status(500).json({ message: 'Error getting top-rated places', error });
  }
};


//Chi tiết place
exports.getPlaceDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const place = await Place.findById(id)
      .populate('category_id')
      .populate('address.landmark_id')
      .populate('address.province_id')
      .populate('address.country_id');

    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    const ratings = await Rating.find({ place_id: id }).populate('user_id', 'username');

    const ratingDetails = ratings.map(rating => ({
      user: rating.user_id ? rating.user_id.username : null,
      rating: rating.rating,
      comment: rating.comment
    }));

    const categoryName = place.category_id ? place.category_id.name : null;
    const landmarkName = place.address.landmark_id ? place.address.landmark_id.name : null;
    const provinceName = place.address.province_id ? place.address.province_id.name : null;
    const countryName = place.address.country_id ? place.address.country_id.name : null;

    const placeDetail = {
      _id: place._id,
      name: place.name,
      category: categoryName,
      address: {
        street: place.address.street,
        ward: place.address.ward,
        district: place.address.district,
        landmark: landmarkName,
        province: provinceName,
        country: countryName
      },
      description: place.description,
      photos: place.photos,
      ratings: ratingDetails 
    };

    res.status(200).json(placeDetail);
  } catch (error) {
    res.status(500).json({ message: 'Error getting place details', error });
  }
};

//Tìm kiếm địa điểm
exports.searchPlaces = async (req, res) => {
  try {
    const { key, page = 1, limit = 10 } = req.body; 
    const skip = (page - 1) * limit; 

    // Tìm kiếm trong Category
    const category = await Category.findOne({ name: new RegExp(key, 'i') });
    if (category) {
      const places = await Place.find({ category_id: category._id })
        .populate('category_id', 'name')
        .populate('address.landmark_id', 'name')
        .populate('address.province_id', 'name')
        .populate('address.country_id', 'name')
        .skip(skip)
        .limit(limit);
      return res.status(200).json({ places });
    }

    // Tìm kiếm trong Landmark
    const landmark = await Landmark.findOne({ name: new RegExp(key, 'i') });
    if (landmark) {
      const places = await Place.find({ 'address.landmark_id': landmark._id })
        .populate('category_id', 'name')
        .populate('address.landmark_id', 'name')
        .populate('address.province_id', 'name')
        .populate('address.country_id', 'name')
        .skip(skip)
        .limit(limit);
      return res.status(200).json({ landmarks: [landmark], places });
    }

    // Tìm kiếm trong Province
    const province = await Province.findOne({ name: new RegExp(key, 'i') });
    if (province) {
      const landmarks = await Landmark.find({ province_id: province._id })
        .skip(skip)
        .limit(limit);
      const places = await Place.find({ 'address.province_id': province._id })
        .populate('category_id', 'name')
        .populate('address.landmark_id', 'name')
        .populate('address.province_id', 'name')
        .populate('address.country_id', 'name')
        .skip(skip)
        .limit(limit);
      return res.status(200).json({ province, landmarks, places });
    }

    // Tìm kiếm trong Place
    const places = await Place.find({ name: new RegExp(key, 'i') })
      .populate('category_id', 'name')
      .populate('address.landmark_id', 'name')
      .populate('address.province_id', 'name')
      .populate('address.country_id', 'name')
      .skip(skip)
      .limit(limit);

    res.status(200).json({ places });
  } catch (error) {
    res.status(500).json({ message: 'Error searching places', error });
  }
};
