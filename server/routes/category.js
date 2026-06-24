const express = require("express");
const multer = require('multer')
const { createCategory, getAllCategory } = require("../controllers/categorycontroller");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheckMiddleware = require("../middleware/roleCheckMiddleware");
const route = express.Router();
const upload = multer()

route.post('/create',authMiddleware,roleCheckMiddleware('admin'),upload.single('thumbnail'),createCategory)
route.get('/allcategory',getAllCategory)



module.exports = route;
