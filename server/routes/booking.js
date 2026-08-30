const express = require("express");
const { createBooking, getQuote, getBookingInstallments, getCancellationPreview, extendBooking, getMyBookings, getHostBookings, getBookingById, cancelBooking, confirmBooking, completeBooking, getPropertyAvailability } = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheckMiddleware = require("../middleware/roleCheckMiddleware");
const route = express.Router();

route.post('/create',authMiddleware,createBooking)
route.get('/availability/:propertyId', getPropertyAvailability)
route.get('/quote', getQuote)
route.get('/mybookings',authMiddleware,getMyBookings)
route.get('/installments/:id',authMiddleware,getBookingInstallments)
route.get('/hostbookings',authMiddleware,roleCheckMiddleware(['host','admin']),getHostBookings)
route.get('/:id',authMiddleware,getBookingById)
route.get('/cancellation-preview/:id',authMiddleware,getCancellationPreview)
route.put('/extend/:id',authMiddleware,extendBooking)
route.put('/cancel/:id',authMiddleware,cancelBooking)
route.put('/confirm/:id',authMiddleware,roleCheckMiddleware(['host','admin']),confirmBooking)
route.put('/complete/:id',authMiddleware,roleCheckMiddleware(['host','admin']),completeBooking)


module.exports = route;
