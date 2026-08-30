const express = require("express");
const { createRule, getPropertyRules, updateRule, deleteRule } = require("../controllers/pricingRuleController");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheckMiddleware = require("../middleware/roleCheckMiddleware");
const route = express.Router();

route.get('/property/:propertyId', getPropertyRules)
route.post('/create', authMiddleware, roleCheckMiddleware(['host','admin']), createRule)
route.put('/update/:id', authMiddleware, roleCheckMiddleware(['host','admin']), updateRule)
route.delete('/delete/:id', authMiddleware, roleCheckMiddleware(['host','admin']), deleteRule)

module.exports = route;
