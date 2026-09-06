const couponSchema = require("../models/couponSchema")
const propertySchema = require("../models/propertySchema")
const pricingRuleSchema = require("../models/pricingRuleSchema")
const { evaluateCoupon } = require("../sevices/couponService")
const { quoteStay, validateStay, nightsBetween } = require("../sevices/pricingEngine")

const createCoupon = async(req,res)=>{
    try {
        const{code,description,discountType,value,maxDiscount,properties,rentalTypes,minNights,minAmount,validFrom,validUntil,maxUses,maxUsesPerUser} = req.body

        if(!code) return res.status(400).send({message : 'Coupon code is required'})
        if(!discountType) return res.status(400).send({message : 'Discount type is required'})
        if(!['percentage','fixed'].includes(discountType)) return res.status(400).send({message : 'Discount type must be percentage or fixed'})
        if(value === undefined || Number(value) <= 0) return res.status(400).send({message : 'A discount value above zero is required'})
        if(discountType === 'percentage' && Number(value) > 100) return res.status(400).send({message : 'A percentage discount cannot exceed 100'})

        const normalised = String(code).trim().toUpperCase()
        const exists = await couponSchema.findOne({code : normalised})
        if(exists) return res.status(400).send({message : 'That code already exists'})

        // ========= a host may only scope a coupon to listings they own =========
        let scoped = []
        if(Array.isArray(properties) && properties.length){
            const owned = await propertySchema.find({_id : {$in : properties},host : req.user._id}).select('_id')
            if(owned.length !== properties.length && req.user.role !== 'admin'){
                return res.status(403).send({message : 'One of those properties is not yours'})
            }
            scoped = properties
        }

        const coupon = await couponSchema.create({
            code : normalised,
            description,
            discountType,
            value : Number(value),
            maxDiscount : maxDiscount ? Number(maxDiscount) : undefined,
            owner : req.user._id,
            properties : scoped,
            rentalTypes : Array.isArray(rentalTypes) ? rentalTypes : [],
            minNights : Number(minNights) || 0,
            minAmount : Number(minAmount) || 0,
            validFrom : validFrom || undefined,
            validUntil : validUntil || undefined,
            maxUses : Number(maxUses) || 0,
            maxUsesPerUser : maxUsesPerUser === undefined ? 1 : Number(maxUsesPerUser),
        })

        // ========= successfull =========
        res.status(201).send({message : 'Coupon created.',coupon})

    }
    catch (error) {
      console.log(error)
      res.status(500).send({message : 'Internal server error'})
    }
}

const getMyCoupons = async(req,res)=>{
    try {
        const filter = req.user.role === 'admin' ? {} : {owner : req.user._id}

        const coupons = await couponSchema.find(filter)
        .populate('properties','title')
        .sort({createdAt : -1})

        // =========== success ==========
        res.status(200).send({message : 'success',coupons})
    }
    catch (error) {
       console.log(error)
       res.status(500).send({message : 'Internal server error'})
    }
}

const updateCoupon = async(req,res)=>{
    try {
        const{id} = req.params

        const coupon = await couponSchema.findById(id)
        if(!coupon) return res.status(404).send({message : 'Coupon not found'})
        if(coupon.owner.toString() !== req.user._id && req.user.role !== 'admin') return res.status(403).send({message : 'Unauthorized'})

        // The code and the count of redemptions are not editable
        const fields = ['description','discountType','value','maxDiscount','properties','rentalTypes','minNights','minAmount','validFrom','validUntil','maxUses','maxUsesPerUser','isActive']
        const updateData = {}
        for(const field of fields){
            if(req.body[field] !== undefined) updateData[field] = req.body[field]
        }

        const updated = await couponSchema.findByIdAndUpdate(id,updateData,{new : true,runValidators : true})

        // ========= successfull =========
        res.status(200).send({message : 'Coupon updated.',coupon : updated})

    }
    catch (error) {
      console.log(error)
      res.status(500).send({message : 'Internal server error'})
    }
}

const deleteCoupon = async(req,res)=>{
    try {
        const{id} = req.params

        const coupon = await couponSchema.findById(id)
        if(!coupon) return res.status(404).send({message : 'Coupon not found'})
        if(coupon.owner.toString() !== req.user._id && req.user.role !== 'admin') return res.status(403).send({message : 'Unauthorized'})

        await couponSchema.findByIdAndDelete(id)

        // ========= successfull =========
        res.status(200).send({message : 'Coupon deleted.'})

    }
    catch (error) {
      console.log(error)
      res.status(500).send({message : 'Internal server error'})
    }
}

// ====== Preview a code against a real stay before booking
const validateCoupon = async(req,res)=>{
    try {
        const{code,propertyId,checkInDate,checkOutDate,rentalType = 'short'} = req.body

        if(!propertyId) return res.status(400).send({message : 'Property id is required'})
        if(!checkInDate || !checkOutDate) return res.status(400).send({message : 'Check-in and check-out dates are required'})

        const property = await propertySchema.findById(propertyId)
        if(!property) return res.status(404).send({message : 'Property not found'})

        const checkIn = new Date(checkInDate)
        const checkOut = new Date(checkOutDate)
        if(isNaN(checkIn) || isNaN(checkOut) || checkIn >= checkOut) return res.status(400).send({message : 'Invalid dates'})

        const stayError = validateStay(property, rentalType, checkIn, checkOut)
        if(stayError) return res.status(400).send({message : stayError})

        const rules = await pricingRuleSchema.find({property : propertyId, isActive : true})
        const base = quoteStay(property, rentalType, checkIn, checkOut, rules)

        const result = await evaluateCoupon({
            code,
            userId : req.user._id,
            property,
            rentalType,
            nights : nightsBetween(checkIn, checkOut),
            amount : base.totalAmount,
        })

        if(!result.ok) return res.status(400).send({message : result.reason})

        const discounted = quoteStay(property, rentalType, checkIn, checkOut, rules, result)

        // =========== success ==========
        res.status(200).send({
            message : `${result.label} applied.`,
            quote : discounted,
            saving : Math.round((base.totalAmount - discounted.totalAmount) * 100) / 100,
        })
    }
    catch (error) {
       console.log(error)
       res.status(500).send({message : 'Internal server error'})
    }
}

module.exports = {createCoupon,getMyCoupons,updateCoupon,deleteCoupon,validateCoupon}
