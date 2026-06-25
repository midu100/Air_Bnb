const conversationSchema = require("../models/conversationSchema");
const userSchema = require("../models/authSchema");

// ========= createConversation =========
const createConversation = async (req, res) => {
  const { participantId } = req.body;
  try {
    if (!participantId) {
      return res.status(400).send({ message : 'Participant ID is required' });
    }

    if (participantId === String(req.user._id)) {
      return res.status(400).send({ message : 'Cannot start a conversation with yourself' });
    }

    const participant = await userSchema.findById(participantId);
    if (!participant) {
      return res.status(404).send({ message : 'Participant not found' });
    }

    const existingConv = await conversationSchema.findOne({
      $or: [
        { creator: req.user._id, participant: participantId },
        { participant: req.user._id, creator: participantId },
      ],
    });

    if (existingConv) {
      return res.status(200).send(existingConv);
    }

    const newConv = new conversationSchema({
      creator: req.user._id,
      participant: participantId,
    });

    await newConv.save();
    res.status(201).send(newConv);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message : 'Internal server error' });
  }
};

// ========= getMyConversations =========
const getMyConversations = async (req, res) => {
  try {
    const convList = await conversationSchema.find({
      $or: [
        { creator: req.user._id },
        { participant: req.user._id },
      ],
    })
      .populate('creator', 'fullName profileImg email')
      .populate('participant', 'fullName profileImg email')
      .sort({ updatedAt: -1 });

    res.status(200).send(convList);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message : 'Internal server error' });
  }
};

// ========= getConversation =========
const getConversation = async (req, res) => {
  const { id } = req.params;
  try {
    const conv = await conversationSchema.findById(id)
      .populate('creator', 'fullName profileImg email')
      .populate('participant', 'fullName profileImg email');

    if (!conv) {
      return res.status(404).send({ message : 'Conversation not found' });
    }

    // Ensure the current user is part of this conversation
    if (String(conv.creator._id) !== String(req.user._id) && String(conv.participant._id) !== String(req.user._id)) {
      return res.status(403).send({ message : 'Unauthorized' });
    }

    res.status(200).send(conv);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message : 'Internal server error' });
  }
};

module.exports = {
  createConversation,
  getMyConversations,
  getConversation,
};
