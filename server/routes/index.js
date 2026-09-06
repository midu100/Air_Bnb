const express = require('express')
const route = express.Router()
const authRoute = require('./auth')
const categoryRoute = require('./category')
const propertyRoute = require('./property')
const amenityRoute = require('./amenity')
const bookingRoute = require('./booking')
const reviewRoute = require('./review')
const wishlistRoute = require('./wishlist')
const paymentRoute = require('./payment')
const conversationRoute = require('./conversation')
const messageRoute = require('./message')
const leaseRoute = require('./lease')
const applicationRoute = require('./application')
const availabilityRoute = require('./availability')
const pricingRuleRoute = require('./pricingRule')
const payoutRoute = require('./payout')
const currencyRoute = require('./currency')
const couponRoute = require('./coupon')

// root endpoints for checking server,Server starting or not.
route.get('/',(req,res)=>{
    res.send('Hello,This is an Air-bnb')
})

route.use('/auth',authRoute)
route.use('/category',categoryRoute)
route.use('/property',propertyRoute)
route.use('/amenity',amenityRoute)
route.use('/booking',bookingRoute)
route.use('/review',reviewRoute)
route.use('/wishlist',wishlistRoute)
route.use('/payment',paymentRoute)
route.use('/conversations',conversationRoute)
route.use('/api/messages',messageRoute)
route.use('/lease',leaseRoute)
route.use('/application',applicationRoute)
route.use('/availability',availabilityRoute)
route.use('/pricing-rule',pricingRuleRoute)
route.use('/payout',payoutRoute)
route.use('/currency',currencyRoute)
route.use('/coupon',couponRoute)


// for any invalid endpoints or route
route.use((req,res)=>{
    res.status(400).send('Page not found')
})


module.exports = route