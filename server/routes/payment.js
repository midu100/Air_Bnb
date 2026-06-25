const express = require("express");
const { createPayment, getPaymentByBooking, getMyPayments, refundPayment } = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");
const route = express.Router();

route.post('/create',authMiddleware,createPayment)
route.get('/booking/:bookingId',authMiddleware,getPaymentByBooking)
route.get('/mypayments',authMiddleware,getMyPayments)
route.put('/refund/:id',authMiddleware,refundPayment)

module.exports = route;
