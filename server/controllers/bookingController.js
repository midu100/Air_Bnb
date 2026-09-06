const bookingSchema = require("../models/bookingSchema")
const propertySchema = require("../models/propertySchema")
const userSchema = require("../models/authSchema")
const sendEmail = require("../sevices/emailServices")
const { bookingConfirmationTemp } = require("../sevices/templates")
const availabilitySchema = require("../models/availabilitySchema")
const installmentSchema = require("../models/installmentSchema")
const pricingRuleSchema = require("../models/pricingRuleSchema")
const { quoteStay, validateStay, refundForCancellation } = require("../sevices/pricingEngine")
const { refundBookingPayment, cancelInstallmentsFor } = require("../sevices/refundService")
const { evaluateCoupon, redeemCoupon, releaseCoupon } = require("../sevices/couponService")

// Matches any booking that still holds the dates - confirmed, or pending inside its payment window
const activeBookingFilter = () => ({
    $or: [
        { bookingStatus: 'confirmed' },
        { bookingStatus: 'pending', expiresAt: { $gt: new Date() } }
    ]
})

const createBooking = async(req,res)=>{
    try {
        const{propertyId,checkInDate,checkOutDate,guestsCount,rentalType = 'short',payer = 'guest',company,couponCode} = req.body

        if(!propertyId) return res.status(400).send({message : 'Property id is required'})
        if(!checkInDate) return res.status(400).send({message : 'Check-in date is required'})
        if(!checkOutDate) return res.status(400).send({message : 'Check-out date is required'})
        if(!guestsCount) return res.status(400).send({message : 'Guests count is required'})
        if(!['short','mid'].includes(rentalType)) return res.status(400).send({message : 'Long-term stays are created as a lease, not a booking'})

        // ========= 1. property exists? =========
        const property = await propertySchema.findById(propertyId)
        if(!property) return res.status(404).send({message : 'Property not found'})

        // ========= 2. property available? =========
        if(property.status !== 'published') return res.status(400).send({message : 'Property is not available'})
        if(guestsCount > property.maxGuests) return res.status(400).send({message : `Max guests allowed is ${property.maxGuests}`})

        // ========= check date overlap =========
        const checkIn = new Date(checkInDate)
        const checkOut = new Date(checkOutDate)

        if(isNaN(checkIn) || isNaN(checkOut)) return res.status(400).send({message : 'Invalid check-in or check-out date'})
        if(checkIn >= checkOut) return res.status(400).send({message : 'Check-out must be after check-in'})

        const existingBooking = await bookingSchema.findOne({
            property : propertyId,
            ...activeBookingFilter(),
            checkInDate : {$lt : checkOut},
            checkOutDate : {$gt : checkIn}
        })
        if(existingBooking) return res.status(400).send({message : 'Property is already booked for these dates'})

        // ========= 2b. host has blocked these dates? =========
        const blocked = await availabilitySchema.findOne({
            property : propertyId,
            startDate : {$lt : checkOut},
            endDate : {$gt : checkIn}
        })
        if(blocked) return res.status(400).send({message : 'The host has made these dates unavailable'})

        // ========= 3. horizon rules - min/max stay, the 30 night boundary =========
        const stayError = validateStay(property, rentalType, checkIn, checkOut)
        if(stayError) return res.status(400).send({message : stayError})

        // ========= 4. price it through the engine, applying any seasonal rules =========
        const rules = await pricingRuleSchema.find({property : propertyId, isActive : true})
        let quote = quoteStay(property, rentalType, checkIn, checkOut, rules)

        // ========= 4b. re-check the coupon here, never trust a client-side price =========
        let couponResult = null
        if(couponCode){
            couponResult = await evaluateCoupon({
                code : couponCode,
                userId : req.user._id,
                property,
                rentalType,
                nights : quote.nights,
                amount : quote.totalAmount,
            })
            if(!couponResult.ok) return res.status(400).send({message : couponResult.reason})
            quote = quoteStay(property, rentalType, checkIn, checkOut, rules, couponResult)
        }

        // ========= 5. create booking =========
        const booking = await bookingSchema.create({
            guest : req.user._id,
            host : property.host,
            property : propertyId,
            rentalType,
            checkInDate : checkIn,
            checkOutDate : checkOut,
            totalNights : quote.nights,
            totalMonths : quote.months,
            guestsCount,
            pricePerNight : property.pricePerNight,
            monthlyRate : quote.monthlyRate,
            discountPercent : quote.discountPercent,
            cleaningFee : quote.cleaningFee,
            serviceFee : quote.serviceFee,
            taxAmount : quote.taxAmount,
            coupon : couponResult?.coupon?._id,
            couponCode : quote.couponCode,
            couponDiscount : quote.couponDiscount || 0,
            securityDeposit : quote.securityDeposit,
            cancellationPolicy : quote.cancellationPolicy,
            billingCycle : quote.billingCycle,
            payer : payer === 'company' ? 'company' : 'guest',
            company : payer === 'company' ? company : undefined,
            nextChargeDate : quote.schedule?.[0]?.dueDate,
            totalAmount : quote.totalAmount,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes payment window
        })

        // ========= 6. settle the race =========
        // Two requests can both clear the check above before either has written. After
        // inserting, look for an overlapping booking that was created first and roll this
        // one back if there is one, so only the earliest writer keeps the dates.
        const conflict = await bookingSchema.findOne({
            _id : {$ne : booking._id},
            property : propertyId,
            checkInDate : {$lt : checkOut},
            checkOutDate : {$gt : checkIn},
            $and : [
                activeBookingFilter(),
                {$or : [
                    {createdAt : {$lt : booking.createdAt}},
                    {createdAt : booking.createdAt, _id : {$lt : booking._id}}
                ]}
            ]
        })

        if(conflict){
            await bookingSchema.findByIdAndDelete(booking._id)
            return res.status(400).send({message : 'Property is already booked for these dates'})
        }

        // ========= 6b. count the redemption, now the booking is certain =========
        if(couponResult?.ok) await redeemCoupon(couponResult.coupon._id)

        // ========= 7. lay out the monthly installments =========
        // The first month is settled at checkout, so the schedule covers what comes after
        if(quote.billingCycle === 'monthly' && quote.schedule?.length){
            await installmentSchema.insertMany(
                quote.schedule.map((charge,index)=>({
                    booking : booking._id,
                    guest : req.user._id,
                    sequence : index + 1,
                    dueDate : charge.dueDate,
                    amount : charge.amount,
                    isProrated : !!charge.prorated,
                    proratedDays : charge.days,
                    status : 'upcoming',
                }))
            )
        }

        // ========= 8. send notification =========
        const guestData = await userSchema.findById(req.user._id)

        sendEmail({
            email : guestData.email,
            subject : 'Booking Confirmation - Air-bnb',
            template : bookingConfirmationTemp,
            item : {
                propertyTitle : property.title,
                checkInDate : checkIn.toDateString(),
                checkOutDate : checkOut.toDateString(),
                guestsCount,
                totalNights : quote.nights,
                totalAmount : quote.totalAmount,
            }
        })

        // ========= successfull =========
        res.status(201).send({message : 'Booking created.',booking})

    } 
    catch (error) {
      console.log(error)
      res.status(500).send({message : 'Internal server error'})
    }
}

// ====== Quote a stay without creating anything
const getQuote = async(req,res)=>{
    try {
        const{propertyId,checkInDate,checkOutDate,rentalType = 'short',couponCode} = req.query

        if(!propertyId) return res.status(400).send({message : 'Property id is required'})
        if(!checkInDate) return res.status(400).send({message : 'Check-in date is required'})
        if(!checkOutDate) return res.status(400).send({message : 'Check-out date is required'})

        const property = await propertySchema.findById(propertyId)
        if(!property) return res.status(404).send({message : 'Property not found'})

        const checkIn = new Date(checkInDate)
        const checkOut = new Date(checkOutDate)
        if(isNaN(checkIn) || isNaN(checkOut)) return res.status(400).send({message : 'Invalid check-in or check-out date'})
        if(checkIn >= checkOut) return res.status(400).send({message : 'Check-out must be after check-in'})

        const stayError = validateStay(property, rentalType, checkIn, checkOut)
        if(stayError) return res.status(400).send({message : stayError})

        const rules = await pricingRuleSchema.find({property : propertyId, isActive : true})
        let quote = quoteStay(property, rentalType, checkIn, checkOut, rules)

        // A bad code must not break the quote, it just does not apply
        let couponError = null
        if(couponCode){
            const result = await evaluateCoupon({
                code : couponCode,
                userId : req.user?._id,
                property,
                rentalType,
                nights : quote.nights,
                amount : quote.totalAmount,
            })
            if(result.ok) quote = quoteStay(property, rentalType, checkIn, checkOut, rules, result)
            else couponError = result.reason
        }

        // =========== success ==========
        res.status(200).send({message : 'success',quote,couponError})
    }
    catch (error) {
       console.log(error)
       res.status(500).send({message : 'Internal server error'})
    }
}

// ====== The monthly plan for one stay
const getBookingInstallments = async(req,res)=>{
    try {
        const{id} = req.params

        const booking = await bookingSchema.findById(id)
        if(!booking) return res.status(404).send({message : 'Booking not found'})

        if(booking.guest.toString() !== req.user._id && booking.host.toString() !== req.user._id) return res.status(403).send({message : 'Unauthorized'})

        const installments = await installmentSchema.find({booking : id}).sort({sequence : 1})

        // =========== success ==========
        res.status(200).send({message : 'success',installments})
    }
    catch (error) {
       console.log(error)
       res.status(500).send({message : 'Internal server error'})
    }
}

const getMyBookings = async(req,res)=>{
    try {
        const bookings = await bookingSchema.find({guest : req.user._id})
        .populate('property','title thumbnail city country pricePerNight')
        .populate('host','fullName profileImg')
        .sort({createdAt : -1})

        // =========== success ==========
        res.status(200).send({message : 'success',bookings})
    } 
    catch (error) {
       console.log(error)
       res.status(500).send({message : 'Internal server error'})
    }
}

const getHostBookings = async(req,res)=>{
    try {
        const bookings = await bookingSchema.find({host : req.user._id})
        .populate('property','title thumbnail city country pricePerNight')
        .populate('guest','fullName profileImg email phone')
        .sort({createdAt : -1})

        // =========== success ==========
        res.status(200).send({message : 'success',bookings})
    } 
    catch (error) {
       console.log(error)
       res.status(500).send({message : 'Internal server error'})
    }
}

const getBookingById = async(req,res)=>{
    try {
        const{id} = req.params

        const booking = await bookingSchema.findById(id)
        .populate('property','title thumbnail city country pricePerNight images address')
        .populate('guest','fullName profileImg email phone')
        .populate('host','fullName profileImg email phone')

        if(!booking) return res.status(404).send({message : 'Booking not found'})

        // ========= check access =========
        if(booking.guest._id.toString() !== req.user._id && booking.host._id.toString() !== req.user._id) return res.status(403).send({message : 'Unauthorized'})

        // =========== success ==========
        res.status(200).send({message : 'success',booking})
    } 
    catch (error) {
       console.log(error)
       res.status(500).send({message : 'Internal server error'})
    }
}

const cancelBooking = async(req,res)=>{
    try {
        const{id} = req.params

        const booking = await bookingSchema.findById(id)
        if(!booking) return res.status(404).send({message : 'Booking not found'})

        // ========= check access =========
        if(booking.guest.toString() !== req.user._id && booking.host.toString() !== req.user._id) return res.status(403).send({message : 'Unauthorized'})

        if(booking.bookingStatus === 'cancelled') return res.status(400).send({message : 'Booking already cancelled'})
        if(booking.bookingStatus === 'completed') return res.status(400).send({message : 'Cannot cancel completed booking'})

        // ========= what comes back depends on the policy and the notice given =========
        const property = await propertySchema.findById(booking.property)
        const refund = refundForCancellation(booking, property)
        const wasPaid = booking.paymentStatus === 'paid'

        booking.bookingStatus = 'cancelled'

        // ========= send the money back, do not merely promise it =========
        // This used to compute the refund, tell the guest it was coming, and never
        // call the gateway. It also left the host's scheduled payout in place.
        let outcome = { refunded: false, amount: 0, reason: null }
        if (wasPaid) {
            outcome = await refundBookingPayment(booking, refund.refundAmount)
            booking.refundAmount = outcome.amount
            if (outcome.refunded) {
                booking.paymentStatus = outcome.amount >= booking.totalAmount ? 'refunded' : 'paid'
            }
        }

        await booking.save()

        // Nothing further should ever be charged on a cancelled stay
        await cancelInstallmentsFor(booking._id)

        // The code becomes usable again
        if(booking.coupon) await releaseCoupon(booking.coupon)

        // ========= successfull =========
        let message = 'Booking cancelled.'
        if (wasPaid && outcome.refunded) {
            message = `Booking cancelled. ${refund.refundPercent}% refundable - $${outcome.amount} has been returned.`
        } else if (wasPaid && refund.refundAmount <= 0) {
            message = `Booking cancelled. This ${refund.policy} policy returns nothing at ${refund.daysBeforeCheckIn} day(s) notice.`
        } else if (wasPaid) {
            message = `Booking cancelled, but the refund could not be sent: ${outcome.reason}. Please contact support.`
        }

        res.status(200).send({ message, booking, refund: { ...refund, refundedAmount: outcome.amount, sent: outcome.refunded } })

    } 
    catch (error) {
      console.log(error)
      res.status(500).send({message : 'Internal server error'})
    }
}

// ====== What a guest would get back if they cancelled right now
const getCancellationPreview = async(req,res)=>{
    try {
        const{id} = req.params

        const booking = await bookingSchema.findById(id)
        if(!booking) return res.status(404).send({message : 'Booking not found'})

        if(booking.guest.toString() !== req.user._id && booking.host.toString() !== req.user._id) return res.status(403).send({message : 'Unauthorized'})

        const property = await propertySchema.findById(booking.property)
        const refund = refundForCancellation(booking, property)

        // =========== success ==========
        res.status(200).send({message : 'success',refund})
    }
    catch (error) {
       console.log(error)
       res.status(500).send({message : 'Internal server error'})
    }
}

// ====== Extend or shorten an active stay, the defining mid-term behaviour
const extendBooking = async(req,res)=>{
    try {
        const{id} = req.params
        const{checkOutDate} = req.body

        if(!checkOutDate) return res.status(400).send({message : 'New check-out date is required'})

        const booking = await bookingSchema.findById(id)
        if(!booking) return res.status(404).send({message : 'Booking not found'})

        if(booking.guest.toString() !== req.user._id) return res.status(403).send({message : 'Unauthorized'})
        if(!['pending','confirmed'].includes(booking.bookingStatus)) return res.status(400).send({message : 'Only an active booking can be changed'})

        const newCheckOut = new Date(checkOutDate)
        if(isNaN(newCheckOut)) return res.status(400).send({message : 'Invalid check-out date'})
        if(newCheckOut <= booking.checkInDate) return res.status(400).send({message : 'Check-out must be after check-in'})
        if(newCheckOut.getTime() === new Date(booking.checkOutDate).getTime()) return res.status(400).send({message : 'That is already the check-out date'})

        const property = await propertySchema.findById(booking.property)
        if(!property) return res.status(404).send({message : 'Property not found'})

        // ========= the added days must be free of other bookings and host blocks =========
        const oldCheckOut = new Date(booking.checkOutDate)
        if(newCheckOut > oldCheckOut){
            const conflict = await bookingSchema.findOne({
                _id : {$ne : booking._id},
                property : booking.property,
                ...activeBookingFilter(),
                checkInDate : {$lt : newCheckOut},
                checkOutDate : {$gt : oldCheckOut}
            })
            if(conflict) return res.status(400).send({message : `Those extra dates are already booked. The stay can run to ${new Date(conflict.checkInDate).toDateString()} at the latest.`})

            const blocked = await availabilitySchema.findOne({
                property : booking.property,
                startDate : {$lt : newCheckOut},
                endDate : {$gt : oldCheckOut}
            })
            if(blocked) return res.status(400).send({message : 'The host has made those extra dates unavailable'})
        }

        // ========= re-price the whole stay on the new range =========
        const stayError = validateStay(property, booking.rentalType, booking.checkInDate, newCheckOut)
        if(stayError) return res.status(400).send({message : stayError})

        const rules = await pricingRuleSchema.find({property : booking.property, isActive : true})
        const quote = quoteStay(property, booking.rentalType, booking.checkInDate, newCheckOut, rules)

        const previousTotal = booking.totalAmount

        booking.checkOutDate = newCheckOut
        booking.totalNights = quote.nights
        booking.totalMonths = quote.months
        booking.discountPercent = quote.discountPercent
        booking.taxAmount = quote.taxAmount
        booking.totalAmount = quote.totalAmount
        await booking.save()

        // ====== Rebuild the unpaid part of the plan on the new dates
        if(quote.billingCycle === 'monthly'){
            await installmentSchema.deleteMany({booking : booking._id,status : {$in : ['upcoming','due']}})
            if(quote.schedule?.length){
                const paidCount = await installmentSchema.countDocuments({booking : booking._id,status : 'paid'})
                await installmentSchema.insertMany(
                    quote.schedule.slice(paidCount).map((charge,index)=>({
                        booking : booking._id,
                        guest : booking.guest,
                        sequence : paidCount + index + 1,
                        dueDate : charge.dueDate,
                        amount : charge.amount,
                        isProrated : !!charge.prorated,
                        proratedDays : charge.days,
                        status : 'upcoming',
                    }))
                )
            }
        }

        const difference = Math.round((quote.totalAmount - previousTotal) * 100) / 100

        // ========= successfull =========
        res.status(200).send({
            message : difference > 0
                ? `Stay extended. $${difference} will be added to your next charge.`
                : `Stay shortened. $${Math.abs(difference)} will be credited back.`,
            booking,
            quote,
            difference,
        })

    }
    catch (error) {
      console.log(error)
      res.status(500).send({message : 'Internal server error'})
    }
}

const confirmBooking = async(req,res)=>{
    try {
        const{id} = req.params

        const booking = await bookingSchema.findById(id)
        if(!booking) return res.status(404).send({message : 'Booking not found'})

        // ========= only host can confirm =========
        if(booking.host.toString() !== req.user._id) return res.status(403).send({message : 'Only host can confirm booking'})

        if(booking.bookingStatus !== 'pending') return res.status(400).send({message : 'Only pending bookings can be confirmed'})

        // Confirming used to set paymentStatus to 'paid' on its own, which handed out
        // free stays. Payment has to land through /payment/create first.
        if(booking.paymentStatus !== 'paid') return res.status(400).send({message : 'Booking cannot be confirmed before payment is completed.'})

        booking.bookingStatus = 'confirmed'
        booking.expiresAt = null
        await booking.save()

        // ========= successfull =========
        res.status(200).send({message : 'Booking confirmed.',booking})

    } 
    catch (error) {
      console.log(error)
      res.status(500).send({message : 'Internal server error'})
    }
}

const completeBooking = async(req,res)=>{
    try {
        const{id} = req.params

        const booking = await bookingSchema.findById(id)
        if(!booking) return res.status(404).send({message : 'Booking not found'})

        // ========= only host can complete =========
        if(booking.host.toString() !== req.user._id) return res.status(403).send({message : 'Only host can complete booking'})

        if(booking.bookingStatus !== 'confirmed') return res.status(400).send({message : 'Only confirmed bookings can be completed'})

        booking.bookingStatus = 'completed'
        await booking.save()

        // ========= successfull =========
        res.status(200).send({message : 'Booking completed.',booking})

    } 
    catch (error) {
      console.log(error)
      res.status(500).send({message : 'Internal server error'})
    }
}

const getPropertyAvailability = async (req, res) => {
    try {
        const { propertyId } = req.params;

        if (!propertyId) {
            return res.status(400).send({ message: 'Property id is required' });
        }

        const bookings = await bookingSchema.find({
            property: propertyId,
            checkOutDate: { $gte: new Date() },
            ...activeBookingFilter()
        }).select('checkInDate checkOutDate -_id');

        // Host blocks make a date just as unavailable as a booking does
        const blocks = await availabilitySchema.find({
            property: propertyId,
            endDate: { $gte: new Date() }
        }).select('startDate endDate -_id');

        const blockRanges = blocks.map(block => ({ checkInDate: block.startDate, checkOutDate: block.endDate }));

        res.status(200).send({ success: true, data: [...bookings, ...blockRanges] });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Internal server error' });
    }
}

module.exports = {createBooking,getQuote,getBookingInstallments,getCancellationPreview,extendBooking,getMyBookings,getHostBookings,getBookingById,cancelBooking,confirmBooking,completeBooking,getPropertyAvailability}
