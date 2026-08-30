const express = require("express");
const { signUp, verifyOtp, signIn, logout, refreshToken, forgotPassword, resetPassword, getProfile } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimiters");
const upload = require("../sevices/uploadConfig");
const route = express.Router();

route.post("/signUp", authLimiter, upload.single('profileImg'), signUp);
route.post("/verifyotp", authLimiter, verifyOtp);
route.post('/signin', authLimiter, signIn)
route.post('/logout', logout)
route.post('/refreshtoken', refreshToken)
route.post('/forgotpassword', authLimiter, forgotPassword)
route.post('/resetpassword', authLimiter, resetPassword)
route.get('/getprofile', authMiddleware, getProfile)

module.exports = route;
