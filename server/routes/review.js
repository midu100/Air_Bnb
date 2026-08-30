const express = require("express");
const { createReview, createGuestReview, getUserReviews, getPropertyReviews, updateReview, deleteReview } = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authMiddleware");
const route = express.Router();

route.post('/create', authMiddleware, createReview)
route.post('/guest', authMiddleware, createGuestReview)
route.get('/user/:userId', getUserReviews)
route.get('/property/:propertyId', getPropertyReviews)
route.put('/update/:id', authMiddleware, updateReview)
route.delete('/delete/:id', authMiddleware, deleteReview)

module.exports = route;
