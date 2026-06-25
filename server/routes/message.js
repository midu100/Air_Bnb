const express = require("express");
const { sendMessage, getMessages, markAsSeen, deleteMessage } = require("../controllers/messageController");
const authMiddleware = require("../middleware/authMiddleware");
const route = express.Router();

route.post('/', authMiddleware, sendMessage);
route.get('/:conversationId', authMiddleware, getMessages);
route.patch('/:id/seen', authMiddleware, markAsSeen);
route.delete('/:id', authMiddleware, deleteMessage);

module.exports = route;
