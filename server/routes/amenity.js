const express = require("express");
const { createAmenity, getAllAmenity, updateAmenity, deleteAmenity } = require("../controllers/amenityController");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheckMiddleware = require("../middleware/roleCheckMiddleware");
const route = express.Router();

route.post('/create',authMiddleware,roleCheckMiddleware(['admin','host']),createAmenity)
route.get('/all',getAllAmenity)
route.put('/update/:id',authMiddleware,roleCheckMiddleware(['admin','host']),updateAmenity)
route.delete('/delete/:id',authMiddleware,roleCheckMiddleware(['admin','host']),deleteAmenity)


module.exports = route;
