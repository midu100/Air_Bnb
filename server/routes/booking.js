const express = require("express");
const { createBooking, getMyBookings, getHostBookings, getBookingById, cancelBooking, confirmBooking, completeBooking, getPropertyAvailability } = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheckMiddleware = require("../middleware/roleCheckMiddleware");
const route = express.Router();

route.post('/create',authMiddleware,createBooking)
route.get('/availability/:propertyId', getPropertyAvailability)
route.get('/mybookings',authMiddleware,getMyBookings)
route.get('/hostbookings',authMiddleware,roleCheckMiddleware('host'),getHostBookings)
route.get('/:id',authMiddleware,getBookingById)
route.put('/cancel/:id',authMiddleware,cancelBooking)
route.put('/confirm/:id',authMiddleware,roleCheckMiddleware('host'),confirmBooking)
route.put('/complete/:id',authMiddleware,roleCheckMiddleware('host'),completeBooking)


module.exports = route;
