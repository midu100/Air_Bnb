const messageSchema = require("../models/messageSchema");
const conversationSchema = require("../models/conversationSchema");

// ========= sendMessage =========
const sendMessage = async (req, res) => {
  const { conversationId, content, contentType = 'text' } = req.body;
  try {
    if (!conversationId || !content) {
      return res.status(400).send({ message : 'conversationId and content are required' });
    }

    const isExistConv = await conversationSchema.findById(conversationId);
    if (!isExistConv) {
      return res.status(400).send({ message : 'Conversation not found' });
    }

    const message = new messageSchema({
      contentType,
      content,
      conversation: conversationId,
      sender: req.user._id,
      seen: false
    });
    await message.save();

    isExistConv.lastMessage = content;
    await isExistConv.save();

    const populatedMessage = await messageSchema.findById(message._id)
      .populate('sender', 'fullName profileImg');

    // Notify room of the new message
    global.io.to(conversationId).emit('message_received', populatedMessage);

    // Re-emit entire message list for ChatWebApplication compatibility
    const messageList = await messageSchema.find({ conversation: conversationId })
      .populate('sender', 'fullName profileImg');
    global.io.to(conversationId).emit('new_message', messageList);

    // Notify both participants to update their conversation lists live
    global.io
      .to(String(isExistConv.creator))
      .to(String(isExistConv.participant))
      .emit('conversation_updated');

    res.status(200).send(populatedMessage);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message : 'Internal server error' });
  }
};

// ========= getMessages =========
const getMessages = async (req, res) => {
  const { conversationId } = req.params;
  try {
    if (!conversationId) {
      return res.status(400).send({ message : 'Conversation ID is required' });
    }

    const messageList = await messageSchema.find({ conversation: conversationId })
      .populate('sender', 'fullName profileImg')
      .sort({ createdAt: 1 });

    global.io.to(conversationId).emit('new_message', messageList);

    res.status(200).send(messageList);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message : 'Internal server error' });
  }
};

// ========= markAsSeen =========
const markAsSeen = async (req, res) => {
  const { id } = req.params;
  try {
    const message = await messageSchema.findById(id);
    if (!message) {
      return res.status(404).send({ message : 'Message not found' });
    }

    message.seen = true;
    await message.save();

    global.io.to(String(message.conversation)).emit('message_seen', {
      messageId: id,
      conversationId: message.conversation
    });

    res.status(200).send(message);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message : 'Internal server error' });
  }
};

// ========= deleteMessage =========
const deleteMessage = async (req, res) => {
  const { id } = req.params;
  try {
    const message = await messageSchema.findById(id);
    if (!message) {
      return res.status(404).send({ message : 'Message not found' });
    }

    if (String(message.sender) !== String(req.user._id)) {
      return res.status(403).send({ message : 'Unauthorized' });
    }

    await messageSchema.findByIdAndDelete(id);

    global.io.to(String(message.conversation)).emit('message_deleted', {
      messageId: id,
      conversationId: message.conversation
    });

    res.status(200).send({ message : 'Message deleted successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message : 'Internal server error' });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  markAsSeen,
  deleteMessage
};
