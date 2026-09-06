const express = require("express");
const { getStatus, ask, confirm, decline, getHistory } = require("../controllers/agentController");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheckMiddleware = require("../middleware/roleCheckMiddleware");
const route = express.Router();

// The assistant is host-scoped - it only ever sees the caller's own data
route.get('/status', authMiddleware, roleCheckMiddleware(['host','admin']), getStatus)
route.post('/ask', authMiddleware, roleCheckMiddleware(['host','admin']), ask)
route.post('/confirm', authMiddleware, roleCheckMiddleware(['host','admin']), confirm)
route.post('/decline', authMiddleware, roleCheckMiddleware(['host','admin']), decline)
route.get('/history', authMiddleware, roleCheckMiddleware(['host','admin']), getHistory)

module.exports = route;
