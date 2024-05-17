const Message = require("../models/message.model");
const Conversation = require("../models/conversation.model");

// Controller to create a new message
const sendMessage = async (req, res) => {
  try {
    const { senderId, recivedId, message } = req.body;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recivedId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, recivedId],
      });
    }

    const newMessage = new Message({
      senderId,
      recivedId,
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

    res.status(200).json(conversation.messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessage,
};
