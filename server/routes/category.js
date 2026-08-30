const express = require("express");
const { createCategory, getAllCategory } = require("../controllers/categorycontroller");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheckMiddleware = require("../middleware/roleCheckMiddleware");
const upload = require("../sevices/uploadConfig");
const route = express.Router();

route.post('/create',authMiddleware,roleCheckMiddleware('admin'),upload.single('thumbnail'),createCategory)
route.get('/allcategory',getAllCategory)



module.exports = route;
