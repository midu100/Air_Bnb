const express = require("express");
const { createConversation, getMyConversations, getConversation } = require("../controllers/conversationController");
const authMiddleware = require("../middleware/authMiddleware");
const route = express.Router();

route.post('/', authMiddleware, createConversation);
route.get('/', authMiddleware, getMyConversations);
route.get('/:id', authMiddleware, getConversation);

module.exports = route;
