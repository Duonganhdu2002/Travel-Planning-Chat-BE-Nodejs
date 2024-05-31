const User = require("../models/user.model");
const Message = require("../models/message.model");
const Conversation = require("../models/conversation.model");

const joinHandler = async (socket, { userId, friendId }) => {
  socket.join(userId);
  socket.join(friendId);
  console.log(`User with ID ${userId} joined room with friend ID ${friendId}`);

  try {
    const user = await User.findById(userId);
    const friendRequests = await User.find(
      {
        _id: { $in: user.waiting_list },
      },
      "id username"
    );

    console.log(`Initial friend requests for user ${userId}:`, friendRequests);
    socket.emit("initial_friend_requests", friendRequests);

    const messages = await Message.find({
      $or: [
        { senderId: userId, recivedId: friendId },
        { senderId: friendId, recivedId: userId },
      ],
    }).sort("createdAt");

    socket.emit("initial_messages", messages);
  } catch (error) {
    console.error(error);
    socket.emit("ERROR", { message: "Failed to fetch data" });
  }
};

const sendMessageHandler = async (socket, { senderId, receiverId, message }) => {
  try {
    const newMessage = new Message({
      senderId,
      recivedId: receiverId,
      message,
    });
    await newMessage.save();

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
        messages: [newMessage._id],
      });
    } else {
      conversation.messages.push(newMessage._id);
    }

    await conversation.save();

    socket.to(receiverId).emit("receive_message", {
      senderId,
      receiverId,
      message,
      createdAt: newMessage.createdAt,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    socket.emit("ERROR", { message: "Failed to send message." });
  }
};

const sendFriendRequestHandler = async (socket, { senderId, receiverId, username }) => {
  try {
    const toUser = await User.findById(receiverId);
    if (!toUser) {
      console.error(`User with ID ${receiverId} not found`);
      return socket.emit("ERROR", { message: "User not found" });
    }
    toUser.waiting_list.push(senderId);
    await toUser.save();

    socket.to(receiverId).emit("receive_friend_request", {
      senderId,
      username,
    });
  } catch (error) {
    console.error(`Failed to send friend request: ${error}`);
    socket.emit("ERROR", { message: "Failed to send friend request" });
  }
};

const acceptFriendRequestHandler = async (socket, { userId, friendId }) => {
  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      console.error("User not found.");
      return socket.emit("ERROR", { message: "User not found." });
    }

    user.list_friend.push(friendId);
    friend.list_friend.push(userId);

    user.waiting_list = user.waiting_list.filter((id) => id.toString() !== friendId);
    friend.invite_list = friend.invite_list.filter((id) => id.toString() !== userId);

    await user.save();
    await friend.save();

    console.log(`Friend request accepted between ${userId} and ${friendId}`);
    socket.to(friendId).emit("friend_request_accepted", { userId, friendId });
    socket.to(userId).emit("friend_request_accepted", { userId, friendId });

    socket.emit("SUCCESS", { message: "Friend request accepted." });
  } catch (error) {
    console.error(error);
    socket.emit("ERROR", { message: "Failed to accept friend request." });
  }
};

const rejectFriendRequestHandler = async (socket, { userId, friendId }) => {
  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      console.error("User not found.");
      return socket.emit("ERROR", { message: "User not found." });
    }

    user.waiting_list = user.waiting_list.filter((id) => id.toString() !== friendId);
    friend.invite_list = friend.invite_list.filter((id) => id.toString() !== userId);

    await user.save();
    await friend.save();

    console.log(`Friend request rejected between ${userId} and ${friendId}`);
    socket.to(friendId).emit("friend_request_rejected", { userId, friendId });
    socket.to(userId).emit("friend_request_rejected", { userId, friendId });

    socket.emit("SUCCESS", { message: "Friend request rejected." });
  } catch (error) {
    console.error(error);
    socket.emit("ERROR", { message: "Failed to reject friend request." });
  }
};

const unfriendHandler = async (socket, { userId, friendId }) => {
  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      console.log("User not found.");
      return socket.emit("ERROR", { message: "User not found." });
    }

    user.list_friend.pull(friendId);
    friend.list_friend.pull(userId);

    await user.save();
    await friend.save();

    console.log(`Unfriended between ${userId} and ${friendId}`);
    socket.to(friendId).emit("unfriend", { userId, friendId });
    socket.to(userId).emit("unfriend", { userId, friendId });

    socket.emit("SUCCESS", { message: "Unfriended successfully." });
  } catch (error) {
    console.error(error);
    socket.emit("ERROR", { message: "Failed to unfriend user." });
  }
};

module.exports = {
  joinHandler,
  sendMessageHandler,
  sendFriendRequestHandler,
  acceptFriendRequestHandler,
  rejectFriendRequestHandler,
  unfriendHandler,
};
