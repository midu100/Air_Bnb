const express = require("express");
const { createCoupon, getMyCoupons, updateCoupon, deleteCoupon, validateCoupon } = require("../controllers/couponController");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheckMiddleware = require("../middleware/roleCheckMiddleware");
const route = express.Router();

route.post('/validate', authMiddleware, validateCoupon)
route.post('/create', authMiddleware, roleCheckMiddleware(['host','admin']), createCoupon)
route.get('/my', authMiddleware, roleCheckMiddleware(['host','admin']), getMyCoupons)
route.put('/update/:id', authMiddleware, roleCheckMiddleware(['host','admin']), updateCoupon)
route.delete('/delete/:id', authMiddleware, roleCheckMiddleware(['host','admin']), deleteCoupon)

module.exports = route;
