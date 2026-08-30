const availabilitySchema = require("../models/availabilitySchema")
const propertySchema = require("../models/propertySchema")
const bookingSchema = require("../models/bookingSchema")
const { buildCalendar, importCalendar } = require("../sevices/icalService")

// ====== Host takes a date range off the market
const blockDates = async(req,res)=>{
    try {
        const{propertyId,startDate,endDate,reason,note} = req.body

        if(!propertyId) return res.status(400).send({message : 'Property id is required'})
        if(!startDate) return res.status(400).send({message : 'Start date is required'})
        if(!endDate) return res.status(400).send({message : 'End date is required'})

        const property = await propertySchema.findById(propertyId)
        if(!property) return res.status(404).send({message : 'Property not found'})

        // ========= only the owner controls the calendar =========
        if(property.host.toString() !== req.user._id && req.user.role !== 'admin') return res.status(403).send({message : 'Unauthorized'})

        const start = new Date(startDate)
        const end = new Date(endDate)
        if(isNaN(start) || isNaN(end)) return res.status(400).send({message : 'Invalid start or end date'})
        if(start >= end) return res.status(400).send({message : 'End date must be after start date'})

        // ========= cannot block over a stay a guest already paid for =========
        const existingBooking = await bookingSchema.findOne({
            property : propertyId,
            $or : [
                { bookingStatus : 'confirmed' },
                { bookingStatus : 'pending', expiresAt : { $gt : new Date() } }
            ],
            checkInDate : {$lt : end},
            checkOutDate : {$gt : start}
        })
        if(existingBooking) return res.status(400).send({message : 'There is already a booking in that range. Cancel it first.'})

        const block = await availabilitySchema.create({
            property : propertyId,
            startDate : start,
            endDate : end,
            reason : reason || 'personal',
            note,
        })

        // ========= successfull =========
        res.status(201).send({message : 'Dates blocked.',block})

    }
    catch (error) {
      console.log(error)
      res.status(500).send({message : 'Internal server error'})
    }
}

const unblockDates = async(req,res)=>{
    try {
        const{id} = req.params

        const block = await availabilitySchema.findById(id).populate('property','host')
        if(!block) return res.status(404).send({message : 'Block not found'})

        if(block.property.host.toString() !== req.user._id && req.user.role !== 'admin') return res.status(403).send({message : 'Unauthorized'})

        await availabilitySchema.findByIdAndDelete(id)

        // ========= successfull =========
        res.status(200).send({message : 'Dates released.'})

    }
    catch (error) {
      console.log(error)
      res.status(500).send({message : 'Internal server error'})
    }
}

// ====== Everything that makes a date unavailable, in one calendar
const getPropertyCalendar = async(req,res)=>{
    try {
        const{propertyId} = req.params

        const now = new Date()

        const bookings = await bookingSchema.find({
            property : propertyId,
            checkOutDate : {$gte : now},
            $or : [
                { bookingStatus : 'confirmed' },
                { bookingStatus : 'pending', expiresAt : { $gt : now } }
            ]
        }).select('checkInDate checkOutDate bookingStatus rentalType')

        const blocks = await availabilitySchema.find({
            property : propertyId,
            endDate : {$gte : now}
        }).select('startDate endDate reason note')

        // =========== success ==========
        res.status(200).send({message : 'success',bookings,blocks})
    }
    catch (error) {
       console.log(error)
       res.status(500).send({message : 'Internal server error'})
    }
}

// ====== Publish this property's calendar for other channels to subscribe to
const exportIcal = async(req,res)=>{
    try {
        const{propertyId} = req.params

        const property = await propertySchema.findById(propertyId).select('title')
        if(!property) return res.status(404).send({message : 'Property not found'})

        const calendar = await buildCalendar(property)

        res.setHeader('Content-Type','text/calendar; charset=utf-8')
        res.setHeader('Content-Disposition',`attachment; filename="property-${propertyId}.ics"`)
        res.status(200).send(calendar)
    }
    catch (error) {
       console.log(error)
       res.status(500).send({message : 'Internal server error'})
    }
}

// ====== Register another channel's feed on this listing
const addIcalFeed = async(req,res)=>{
    try {
        const{propertyId,label,url} = req.body

        if(!propertyId) return res.status(400).send({message : 'Property id is required'})
        if(!url) return res.status(400).send({message : 'Feed URL is required'})
        if(!/^https?:\/\//i.test(url)) return res.status(400).send({message : 'Feed URL must start with http or https'})

        const property = await propertySchema.findById(propertyId)
        if(!property) return res.status(404).send({message : 'Property not found'})
        if(property.host.toString() !== req.user._id && req.user.role !== 'admin') return res.status(403).send({message : 'Unauthorized'})

        property.icalUrls.push({label : label || 'External calendar',url})
        await property.save()

        // ========= successfull =========
        res.status(201).send({message : 'Calendar feed added.',icalUrls : property.icalUrls})

    }
    catch (error) {
      console.log(error)
      res.status(500).send({message : 'Internal server error'})
    }
}

// ====== Pull every registered feed and mirror it as blocked dates
const syncIcalFeeds = async(req,res)=>{
    try {
        const{propertyId} = req.params

        const property = await propertySchema.findById(propertyId)
        if(!property) return res.status(404).send({message : 'Property not found'})
        if(property.host.toString() !== req.user._id && req.user.role !== 'admin') return res.status(403).send({message : 'Unauthorized'})
        if(!property.icalUrls?.length) return res.status(400).send({message : 'No calendar feeds are set up for this property'})

        const results = []
        for(const feed of property.icalUrls){
            try {
                const outcome = await importCalendar(property,feed)
                feed.lastSyncedAt = new Date()
                results.push({label : feed.label,url : feed.url,...outcome})
            } catch (error) {
                console.log(error)
                results.push({label : feed.label,url : feed.url,error : error?.message || 'Sync failed'})
            }
        }
        await property.save()

        // ========= successfull =========
        res.status(200).send({message : 'Calendars synced.',results})

    }
    catch (error) {
      console.log(error)
      res.status(500).send({message : 'Internal server error'})
    }
}

module.exports = {blockDates,unblockDates,getPropertyCalendar,exportIcal,addIcalFeed,syncIcalFeeds}
