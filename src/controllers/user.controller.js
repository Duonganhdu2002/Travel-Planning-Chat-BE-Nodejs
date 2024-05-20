const User = require("../models/user.model");

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};

exports.getWaitingList = async (req, res) => {
  const { userId } = req.params; // Lấy userId từ request parameters

  try {
    // Tìm người dùng theo userId và populate only id and username of users in the waiting list
    const user = await User.findById(userId).populate(
      "waiting_list",
      "id username"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Phản hồi danh sách waiting_list của người dùng
    return res.status(200).json({ waiting_list: user.waiting_list });
  } catch (err) {
    // Xử lý lỗi nếu có
    console.error("Error retrieving waiting list:", err);
    return res.status(500).json({
      message: "Error retrieving waiting list.",
      error: err,
    });
  }
};

exports.checkWaitingListStatus = async (req, res) => {
  const { userId1, userId2 } = req.body; // Lấy userId của hai người dùng từ request body

  try {
    // Tìm người dùng thứ hai
    const user2 = await User.findById(userId2);
    if (!user2) {
      return res
        .status(404)
        .json({ isInWaitingList: false, message: "User not found." });
    }

    // Kiểm tra xem userId1 có nằm trong waiting_list của userId2 hay không
    const isInWaitingList = user2.waiting_list.includes(userId1);

    // Phản hồi kết quả
    return res.status(200).json({ isInWaitingList: isInWaitingList });
  } catch (err) {
    // Xử lý lỗi nếu có
    console.error("Error checking waiting list status:", err);
    return res.status(500).json({
      isInWaitingList: false,
      message: "Error checking waiting list status.",
      error: err,
    });
  }
};

exports.sendFriendRequest = async (req, res) => {
  const { userId1, userId2 } = req.body; // Lấy userId của hai người dùng từ request body

  try {
    // Tìm người dùng thứ nhất
    const user1 = await User.findById(userId1);
    if (!user1) {
      return res.status(404).json({ success: false, result: false });
    }

    // Tìm người dùng thứ hai
    const user2 = await User.findById(userId2);
    if (!user2) {
      return res.status(404).json({ success: false, result: false });
    }

    // Kiểm tra xem userId1 đã có trong waiting_list của userId2 chưa
    if (user2.waiting_list.includes(userId1)) {
      return res.status(400).json({ success: false, result: false });
    }

    // Thêm userId1 vào waiting_list của userId2
    user2.waiting_list.push(userId1);
    await user2.save();

    // Thêm userId2 vào invite_list của userId1
    user1.invite_list.push(userId2);
    await user1.save();

    // Phản hồi thành công
    return res.status(200).json({ success: true, result: true });
  } catch (err) {
    // Xử lý lỗi nếu có
    console.error("Error sending friend request:", err);
    return res.status(500).json({ success: false, result: false });
  }
};

exports.checkFriendStatus = async (req, res) => {
  const { userId1, userId2 } = req.body; // Lấy userId của hai người dùng từ request body

  try {
    // Tìm người dùng thứ nhất
    const user1 = await User.findById(userId1);
    if (!user1) {
      return res
        .status(404)
        .json({ areFriends: false, message: "User not found." });
    }

    // Kiểm tra xem userId2 có nằm trong danh sách bạn của userId1 hay không
    const isFriend = user1.list_friend.includes(userId2);

    // Phản hồi kết quả
    return res.status(200).json({ areFriends: isFriend });
  } catch (err) {
    // Xử lý lỗi nếu có
    console.error("Error checking friend status:", err);
    return res.status(500).json({
      areFriends: false,
      message: "Error checking friend status.",
      error: err,
    });
  }
};

exports.getAllUsers = (req, res) => {
  User.find({}, "-password")
    .then((users) => {
      res.status(200).send(users);
    })
    .catch((err) => {
      res.status(500).send({ message: "Error retrieving users.", error: err });
    });
};

exports.getUserById = (req, res) => {
  const userId = req.params.id; // Lấy userId từ request parameters

  User.findById(userId, "-password") // Tìm người dùng trong database dựa trên userId, loại bỏ trường password
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User not found." });
      }
      res.status(200).send(user); // Trả về thông tin chi tiết của người dùng
    })
    .catch((err) => {
      res.status(500).send({ message: "Error retrieving user.", error: err });
    });
};

exports.updateUser = (req, res) => {
  const userId = req.body.id;
  const updateData = req.body;

  User.findByIdAndUpdate(userId, updateData, { new: true })
    .then((updatedUser) => {
      if (!updatedUser) {
        return res.status(404).send({ message: "User not found." });
      }
      res
        .status(200)
        .send({ message: "User updated successfully.", user: updatedUser });
    })
    .catch((err) => {
      res.status(500).send({ message: "Error updating user.", error: err });
    });
};
