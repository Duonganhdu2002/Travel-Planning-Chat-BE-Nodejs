const Notification = require('../models/notification.model');

// Tạo thông báo mới
exports.createNotification = async (req, res) => {
  const { userId, message } = req.body;

  try {
    const notification = new Notification({ userId, message });
    await notification.save();

    // Gửi thông báo thời gian thực qua WebSocket
    req.app.get('io').to(userId).emit('notification', notification);

    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Error creating notification', error: err });
  }
};

// Lấy tất cả thông báo của người dùng
exports.getUserNotifications = async (req, res) => {
  const { userId } = req.params;

  try {
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notifications', error: err });
  }
};

// Đánh dấu thông báo là đã đọc
exports.markAsRead = async (req, res) => {
  const { notificationId } = req.params;

  try {
    const notification = await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
    res.status(200).json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Error marking notification as read', error: err });
  }
};
