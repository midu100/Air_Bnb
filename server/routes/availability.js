const express = require("express");
const { blockDates, unblockDates, getPropertyCalendar, exportIcal, addIcalFeed, syncIcalFeeds } = require("../controllers/availabilityController");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheckMiddleware = require("../middleware/roleCheckMiddleware");
const route = express.Router();

route.get('/calendar/:propertyId', getPropertyCalendar)
route.get('/ical/:propertyId.ics', exportIcal)
route.post('/ical/feed', authMiddleware, roleCheckMiddleware(['host','admin']), addIcalFeed)
route.post('/ical/sync/:propertyId', authMiddleware, roleCheckMiddleware(['host','admin']), syncIcalFeeds)
route.post('/block', authMiddleware, roleCheckMiddleware(['host','admin']), blockDates)
route.delete('/block/:id', authMiddleware, roleCheckMiddleware(['host','admin']), unblockDates)

module.exports = route;
