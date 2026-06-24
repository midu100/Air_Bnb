const express = require("express");
const { createAmenity, getAllAmenity, updateAmenity, deleteAmenity } = require("../controllers/amenityController");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheckMiddleware = require("../middleware/roleCheckMiddleware");
const route = express.Router();

route.post('/create',authMiddleware,roleCheckMiddleware('admin'),createAmenity)
route.get('/all',getAllAmenity)
route.put('/update/:id',authMiddleware,roleCheckMiddleware('admin'),updateAmenity)
route.delete('/delete/:id',authMiddleware,roleCheckMiddleware('admin'),deleteAmenity)


module.exports = route;
