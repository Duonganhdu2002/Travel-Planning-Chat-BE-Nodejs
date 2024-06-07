const Planning = require('../models/planning.model');
const User = require('../models/user.model'); 

// Tạo kế hoạch mới
exports.createPlanning = async (req, res) => {
  try {
    const { participants, place_id, day_start, day_end, fund, plan_owner, public, name } = req.body;

    const newPlanning = new Planning({
      participants,
      place_id,
      day_start,
      day_end,
      fund,
      plan_owner,
      public,
      name
    });

    await newPlanning.save();
    
    // Cập nhật danh sách kế hoạch của người dùng
    await User.findByIdAndUpdate(plan_owner, { $push: { plan_list: newPlanning._id } });

    res.status(201).json({ message: 'Planning created successfully', planning: newPlanning });
  } catch (error) {
    res.status(500).json({ message: 'Error creating planning', error });
  }
};

// Lấy danh sách tất cả các kế hoạch
exports.getPlannings = async (req, res) => {
  try {
    const plannings = await Planning.find().populate('participants').populate('place_id').populate('plan_owner');
    res.status(200).json(plannings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching plannings', error });
  }
};

// Lấy thông tin chi tiết một kế hoạch
exports.getPlanningById = async (req, res) => {
  try {
    const planning = await Planning.findById(req.params.id).populate('participants').populate('place_id').populate('plan_owner');
    if (!planning) {
      return res.status(404).json({ message: 'Planning not found' });
    }
    res.status(200).json(planning);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching planning', error });
  }
};

// Cập nhật kế hoạch
exports.updatePlanning = async (req, res) => {
  try {
    const updatedPlanning = await Planning.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('participants').populate('place_id').populate('plan_owner');
    if (!updatedPlanning) {
      return res.status(404).json({ message: 'Planning not found' });
    }
    res.status(200).json({ message: 'Planning updated successfully', planning: updatedPlanning });
  } catch (error) {
    res.status(500).json({ message: 'Error updating planning', error });
  }
};

// Xóa kế hoạch
exports.deletePlanning = async (req, res) => {
  try {
    const deletedPlanning = await Planning.findByIdAndDelete(req.params.id);
    if (!deletedPlanning) {
      return res.status(404).json({ message: 'Planning not found' });
    }
    
    // Cập nhật danh sách kế hoạch của người dùng
    await User.findByIdAndUpdate(deletedPlanning.plan_owner, { $pull: { plan_list: deletedPlanning._id } });

    res.status(200).json({ message: 'Planning deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting planning', error });
  }
};
