const express = require("express");
const { getExchangeRates, convertAmount } = require("../controllers/currencyController");
const route = express.Router();

route.get('/rates', getExchangeRates)
route.get('/convert', convertAmount)

module.exports = route;
