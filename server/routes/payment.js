const express = require("express");
const { createCheckoutSession, stripeWebhook, getPaymentByBooking, getMyPayments, refundPayment } = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");
const route = express.Router();

// Stripe posts here directly, so no auth middleware - the signature is the proof
route.post('/webhook',stripeWebhook)
route.post('/create-session',authMiddleware,createCheckoutSession)
route.get('/booking/:bookingId',authMiddleware,getPaymentByBooking)
route.get('/mypayments',authMiddleware,getMyPayments)
route.put('/refund/:id',authMiddleware,refundPayment)

module.exports = route;
