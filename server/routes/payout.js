const express = require("express");
const { createOnboardingLink, getAccountStatus, getMyPayouts } = require("../controllers/payoutController");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheckMiddleware = require("../middleware/roleCheckMiddleware");
const route = express.Router();

route.post('/onboard', authMiddleware, roleCheckMiddleware(['host','admin']), createOnboardingLink)
route.get('/status', authMiddleware, roleCheckMiddleware(['host','admin']), getAccountStatus)
route.get('/my', authMiddleware, roleCheckMiddleware(['host','admin']), getMyPayouts)

module.exports = route;
