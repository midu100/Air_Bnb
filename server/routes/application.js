const express = require("express");
const { createApplication, getMyApplications, getLandlordApplications, decideApplication, withdrawApplication } = require("../controllers/applicationController");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheckMiddleware = require("../middleware/roleCheckMiddleware");
const route = express.Router();

route.post('/create', authMiddleware, createApplication)
route.get('/my', authMiddleware, getMyApplications)
route.get('/landlord', authMiddleware, roleCheckMiddleware(['host','admin']), getLandlordApplications)
route.put('/decide/:id', authMiddleware, roleCheckMiddleware(['host','admin']), decideApplication)
route.put('/withdraw/:id', authMiddleware, withdrawApplication)

module.exports = route;
