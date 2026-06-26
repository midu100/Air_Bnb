const bookingSchema = require("../models/bookingSchema")
const propertySchema = require("../models/propertySchema")
const userSchema = require("../models/authSchema")
const sendEmail = require("../sevices/emailServices")
const { bookingConfirmationTemp } = require("../sevices/templates")

const createBooking = async(req,res)=>{
    try {
        const{propertyId,checkInDate,checkOutDate,guestsCount} = req.body

        if(!propertyId) return res.status(400).send({message : 'Property id is required'})
        if(!checkInDate) return res.status(400).send({message : 'Check-in date is required'})
        if(!checkOutDate) return res.status(400).send({message : 'Check-out date is required'})
        if(!guestsCount) return res.status(400).send({message : 'Guests count is required'})

        // ========= 1. property exists? =========
        const property = await propertySchema.findById(propertyId)
        if(!property) return res.status(404).send({message : 'Property not found'})

        // ========= 2. property available? =========
        if(property.status !== 'published') return res.status(400).send({message : 'Property is not available'})
        if(guestsCount > property.maxGuests) return res.status(400).send({message : `Max guests allowed is ${property.maxGuests}`})

        // ========= check date overlap =========
        const checkIn = new Date(checkInDate)
        const checkOut = new Date(checkOutDate)

        if(checkIn >= checkOut) return res.status(400).send({message : 'Check-out must be after check-in'})

        const existingBooking = await bookingSchema.findOne({
            property : propertyId,
            $or: [
                { bookingStatus: 'confirmed' },
                { bookingStatus: 'pending', expiresAt: { $gt: new Date() } }
            ],
            checkInDate : {$lt : checkOut},
            checkOutDate : {$gt : checkIn}
        })
        if(existingBooking) return res.status(400).send({message : 'Property is already booked for these dates'})

        // ========= 3. calculate nights =========
        const totalNights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))

        // ========= 4. calculate amount =========
        const totalAmount = (property.pricePerNight * totalNights) + property.cleaningFee + property.serviceFee

        // ========= 5. create booking =========
        const booking = new bookingSchema({
            guest : req.user._id,
            host : property.host,
            property : propertyId,
            checkInDate : checkIn,
            checkOutDate : checkOut,
            totalNights,
            guestsCount,
            pricePerNight : property.pricePerNight,
            cleaningFee : property.cleaningFee,
            serviceFee : property.serviceFee,
            totalAmount,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes payment window
        })
        await booking.save()

        // ========= 6. send notification =========
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
                totalNights,
                totalAmount,
            }
        })

        // ========= successfull =========
        res.status(201).send({message : 'Booking created.',booking})

    } 
    catch (error) {
      console.log(error)    
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
        if(booking.guest._id.toString() !== req.user._id && booking.host._id.toString() !== req.user._id) return res.status(401).send({message : 'Unauthorized'})

        // =========== success ==========
        res.status(200).send({message : 'success',booking})
    } 
    catch (error) {
       console.log(error)  
    }
}

const cancelBooking = async(req,res)=>{
    try {
        const{id} = req.params

        const booking = await bookingSchema.findById(id)
        if(!booking) return res.status(404).send({message : 'Booking not found'})

        // ========= check access =========
        if(booking.guest.toString() !== req.user._id && booking.host.toString() !== req.user._id) return res.status(401).send({message : 'Unauthorized'})

        if(booking.bookingStatus === 'cancelled') return res.status(400).send({message : 'Booking already cancelled'})
        if(booking.bookingStatus === 'completed') return res.status(400).send({message : 'Cannot cancel completed booking'})

        booking.bookingStatus = 'cancelled'
        await booking.save()

        // ========= successfull =========
        res.status(200).send({message : 'Booking cancelled.',booking})

    } 
    catch (error) {
      console.log(error)    
    }
}

const confirmBooking = async(req,res)=>{
    try {
        const{id} = req.params

        const booking = await bookingSchema.findById(id)
        if(!booking) return res.status(404).send({message : 'Booking not found'})

        // ========= only host can confirm =========
        if(booking.host.toString() !== req.user._id) return res.status(401).send({message : 'Only host can confirm booking'})

        if(booking.bookingStatus !== 'pending') return res.status(400).send({message : 'Only pending bookings can be confirmed'})

        booking.bookingStatus = 'confirmed'
        booking.paymentStatus = 'paid'
        await booking.save()

        // ========= successfull =========
        res.status(200).send({message : 'Booking confirmed.',booking})

    } 
    catch (error) {
      console.log(error)    
    }
}

const completeBooking = async(req,res)=>{
    try {
        const{id} = req.params

        const booking = await bookingSchema.findById(id)
        if(!booking) return res.status(404).send({message : 'Booking not found'})

        // ========= only host can complete =========
        if(booking.host.toString() !== req.user._id) return res.status(401).send({message : 'Only host can complete booking'})

        if(booking.bookingStatus !== 'confirmed') return res.status(400).send({message : 'Only confirmed bookings can be completed'})

        booking.bookingStatus = 'completed'
        await booking.save()

        // ========= successfull =========
        res.status(200).send({message : 'Booking completed.',booking})

    } 
    catch (error) {
      console.log(error)    
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
            $or: [
                { bookingStatus: 'confirmed' },
                { bookingStatus: 'pending', expiresAt: { $gt: new Date() } }
            ]
        }).select('checkInDate checkOutDate -_id');

        res.status(200).send({ success: true, data: bookings });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Server error' });
    }
}

module.exports = {createBooking,getMyBookings,getHostBookings,getBookingById,cancelBooking,confirmBooking,completeBooking,getPropertyAvailability}

