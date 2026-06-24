const express = require("express");
const multer = require('multer')
const { createProperty, getProperties, getPropertyById, updateProperty, deleteProperty, getHostProperties, searchProperties, getFeaturedProperties } = require("../controllers/propertyController");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheckMiddleware = require("../middleware/roleCheckMiddleware");
const route = express.Router();
const upload = multer()

route.post('/create',authMiddleware,roleCheckMiddleware('host'),upload.fields([{name:'thumbnail',maxCount:1},{name:'images',maxCount:10}]),createProperty)
route.get('/all',getProperties)
route.get('/featured',getFeaturedProperties)
route.get('/search',searchProperties)
route.get('/host',authMiddleware,roleCheckMiddleware('host'),getHostProperties)
route.get('/:id',getPropertyById)
route.put('/update/:id',authMiddleware,roleCheckMiddleware('host'),upload.fields([{name:'thumbnail',maxCount:1},{name:'images',maxCount:10}]),updateProperty)
route.delete('/delete/:id',authMiddleware,roleCheckMiddleware('host'),deleteProperty)


module.exports = route;
