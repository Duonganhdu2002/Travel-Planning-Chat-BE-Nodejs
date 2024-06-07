const User = require("../models/user.model");
const Message = require("../models/message.model");
const Conversation = require("../models/conversation.model");
const Place = require("../models/places.model");
const multer = require("multer");
const path = require("path"); // Thêm dòng này

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/public/images/avatars");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

exports.upload = upload; // Export the upload middleware

exports.uploadAvatar = async (req, res) => {
  try {
    const userId = req.body.userId;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Lưu đường dẫn file avatar vào user
    user.avatar = req.file.filename;
    await user.save();

    res
      .status(200)
      .json({ message: "Avatar uploaded successfully", avatar: user.avatar });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    res.status(500).json({ message: "Error uploading avatar", error });
  }
};

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

exports.getConversations = async (req, res) => {
  const { userId } = req.params;

  try {
    const conversations = await Conversation.find({ participants: userId })
      .populate("participants", "username avatar")
      .populate({
        path: "messages",
        options: { sort: { createdAt: -1 }, limit: 1 },
      });

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Error fetching conversations", error });
  }
};

exports.messages = async (req, res) => {
  const { userId, friendId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { senderId: userId, recivedId: friendId },
        { senderId: friendId, recivedId: userId },
      ],
    }).sort("createdAt");

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages" });
  }
};

exports.unfriend = async (req, res) => {
  const { userId, friendId } = req.body;

  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: "User not found." });
    }

    user.list_friend.pull(friendId);
    friend.list_friend.pull(userId);

    await user.save();
    await friend.save();

    res.status(200).json({ message: "Unfriended successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to unfriend user.", error });
  }
};

exports.getFriendList = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate(
      "list_friend",
      "id username avatar"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const friends = user.list_friend.map((friend) => ({
      id: friend._id,
      username: friend.username,
      avatar: friend.avatar,
    }));

    return res.status(200).json(friends);
  } catch (err) {
    console.error("Error retrieving friends list:", err);
    return res.status(500).json({
      message: "Error retrieving friends list.",
      error: err,
    });
  }
};

exports.getFriendList = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate(
      "list_friend",
      "id username avatar"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({ friends: user.list_friend });
  } catch (err) {
    console.error("Error retrieving friends list:", err);
    return res.status(500).json({
      message: "Error retrieving friends list.",
      error: err,
    });
  }
};

exports.getWaitingList = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate(
      "waiting_list",
      "id username"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({ waiting_list: user.waiting_list });
  } catch (err) {
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
  const { senderId, receiverId } = req.body;

  try {
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: "User not found." });
    }

    if (receiver.waiting_list.includes(senderId)) {
      return res.status(400).json({ message: "Friend request already sent." });
    }

    receiver.waiting_list.push(senderId);
    await receiver.save();

    sender.invite_list.push(receiverId);
    await sender.save();

    return res
      .status(200)
      .json({ message: "Friend request sent successfully." });
  } catch (err) {
    console.error("Error sending friend request:", err);
    return res.status(500).json({
      message: "Error sending friend request.",
      error: err,
    });
  }
};

exports.checkFriendStatus = async (req, res) => {
  const { userId1, userId2 } = req.body;

  try {
    const user1 = await User.findById(userId1);
    const user2 = await User.findById(userId2);

    if (!user1 || !user2) {
      return res.status(404).json({ message: "User not found." });
    }

    const isFriend = user1.list_friend.includes(userId2);
    const isPending = user2.waiting_list.includes(userId1);

    if (isFriend) {
      return res.status(200).json({ status: "friends" });
    } else if (isPending) {
      return res.status(200).json({ status: "pending" });
    } else {
      return res.status(200).json({ status: "none" });
    }
  } catch (err) {
    console.error("Error checking friend status:", err);
    return res.status(500).json({
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

// Hàm thêm địa điểm vào danh sách bookmark của người dùng
exports.addBookmark = async (req, res) => {
  try {
    const { userId, placeId } = req.body;

    const place = await Place.findById(placeId);
    if (!place) {
      return res.status(404).json({ message: "Place not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.book_mark_list.includes(placeId)) {
      user.book_mark_list.push(placeId);
      await user.save();
    }

    res.status(200).json({ message: "Place added to bookmarks", user });
  } catch (error) {
    res.status(500).json({ message: "Error adding place to bookmarks", error });
  }
};
