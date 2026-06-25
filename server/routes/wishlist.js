const express = require("express");
const { addToWishlist, removeFromWishlist, getMyWishlist, clearWishlist } = require("../controllers/wishlistController");
const authMiddleware = require("../middleware/authMiddleware");
const route = express.Router();

route.post('/add',authMiddleware,addToWishlist)
route.delete('/remove/:propertyId',authMiddleware,removeFromWishlist)
route.get('/my',authMiddleware,getMyWishlist)
route.delete('/clear',authMiddleware,clearWishlist)

module.exports = route;
