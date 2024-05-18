const Message = require("../models/message.model");
const Conversation = require("../models/conversation.model");

// Controller to create a new message
const sendMessage = async (req, res) => {
  try {
    const { senderId, receivedId, message } = req.body;

    if (!senderId || !receivedId || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receivedId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receivedId],
      });
    }

    const newMessage = new Message({
      senderId,
      receivedId,
      message,
    });

    const savedMessage = await newMessage.save();

    if (savedMessage) {
      conversation.messages.push(savedMessage._id);
      await conversation.save();
    }

    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMessage = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate("messages");

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    res.status(200).json(conversation.messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessage,
};
