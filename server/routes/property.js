const express = require("express");
const { createProperty, getProperties, getPropertyById, updateProperty, deleteProperty, getHostProperties, searchProperties, getFeaturedProperties } = require("../controllers/propertyController");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheckMiddleware = require("../middleware/roleCheckMiddleware");
const upload = require("../sevices/uploadConfig");
const route = express.Router();

route.post('/create',authMiddleware,roleCheckMiddleware(['host','admin']),upload.fields([{name:'thumbnail',maxCount:1},{name:'images',maxCount:10}]),createProperty)
route.get('/all',getProperties)
route.get('/featured',getFeaturedProperties)
route.get('/search',searchProperties)
route.get('/host',authMiddleware,roleCheckMiddleware(['host','admin']),getHostProperties)
route.get('/:id',getPropertyById)
route.put('/update/:id',authMiddleware,roleCheckMiddleware(['host','admin']),upload.fields([{name:'thumbnail',maxCount:1},{name:'images',maxCount:10}]),updateProperty)
route.delete('/delete/:id',authMiddleware,roleCheckMiddleware(['host','admin']),deleteProperty)


module.exports = route;
