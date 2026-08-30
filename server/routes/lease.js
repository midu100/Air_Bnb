const express = require("express");
const { getLeaseQuote, createLease, signLease, giveNotice, getMyLeases, getLeaseLedger } = require("../controllers/leaseController");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheckMiddleware = require("../middleware/roleCheckMiddleware");
const route = express.Router();

route.get('/quote', getLeaseQuote)
route.post('/create', authMiddleware, roleCheckMiddleware(['host','admin']), createLease)
route.get('/my', authMiddleware, getMyLeases)
route.get('/:id/ledger', authMiddleware, getLeaseLedger)
route.put('/sign/:id', authMiddleware, signLease)
route.put('/notice/:id', authMiddleware, giveNotice)

module.exports = route;
