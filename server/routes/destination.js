const express = require("express");
const { createDestination, getAllDestination, getAdminDestination, updateDestination, deleteDestination } = require("../controllers/destinationController");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheckMiddleware = require("../middleware/roleCheckMiddleware");
const upload = require("../sevices/uploadConfig");
const route = express.Router();

route.get('/all',getAllDestination)
route.get('/admin',authMiddleware,roleCheckMiddleware('admin'),getAdminDestination)
route.post('/create',authMiddleware,roleCheckMiddleware('admin'),upload.single('image'),createDestination)
route.put('/update/:id',authMiddleware,roleCheckMiddleware('admin'),upload.single('image'),updateDestination)
route.delete('/delete/:id',authMiddleware,roleCheckMiddleware('admin'),deleteDestination)

module.exports = route;
