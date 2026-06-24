const express = require("express");
const multer  = require('multer')
const { signUp, verifyOtp, signIn, getProfile } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const route = express.Router();
const upload = multer()

route.post("/signUp",upload.single('profileImg'), signUp);
route.post("/verifyotp", verifyOtp);
route.post('/signin',signIn)
route.get('/getprofile',authMiddleware,getProfile)

module.exports = route;
