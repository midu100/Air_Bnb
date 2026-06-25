const paymentSchema = require("../models/paymentSchema")
const bookingSchema = require("../models/bookingSchema")

const createPayment = async(req,res)=>{
    try {
        const{bookingId,paymentMethod,transactionId} = req.body

        if(!bookingId) return res.status(400).send({message : 'Booking id is required'})
        if(!paymentMethod) return res.status(400).send({message : 'Payment method is required'})
        if(!transactionId) return res.status(400).send({message : 'Transaction id is required'})

        // ========= 1. booking exists? =========
        const booking = await bookingSchema.findById(bookingId)
        if(!booking) return res.status(404).send({message : 'Booking not found'})

        // ========= 2. check access =========
        if(booking.guest.toString() !== req.user._id) return res.status(401).send({message : 'Unauthorized'})

        // ========= 3. booking already paid? =========
        if(booking.paymentStatus === 'paid') return res.status(400).send({message : 'Booking already paid'})

        // ========= 4. already has payment? =========
        const existingPayment = await paymentSchema.findOne({booking : bookingId,status : 'paid'})
        if(existingPayment) return res.status(400).send({message : 'Payment already exists for this booking'})

        // ========= 5. create payment =========
        const payment = new paymentSchema({
            booking : bookingId,
            user : req.user._id,
            transactionId,
            paymentMethod,
            amount : booking.totalAmount,
            currency : 'USD',
            status : 'paid'
        })
        await payment.save()

        // ========= 6. update booking payment status =========
        booking.paymentStatus = 'paid'
        await booking.save()

        // ========= successfull =========
        res.status(201).send({message : 'Payment successfull.',payment})

    } 
    catch (error) {
      console.log(error)    
    }
}

const getPaymentByBooking = async(req,res)=>{
    try {
        const{bookingId} = req.params

        const payment = await paymentSchema.findOne({booking : bookingId})
        .populate('booking','checkInDate checkOutDate totalAmount bookingStatus')
        .populate('user','fullName email')

        if(!payment) return res.status(404).send({message : 'Payment not found'})

        // ========= check access =========
        if(payment.user._id.toString() !== req.user._id) return res.status(401).send({message : 'Unauthorized'})

        // =========== success ==========
        res.status(200).send({message : 'success',payment})
    } 
    catch (error) {
       console.log(error)  
    }
}

const getMyPayments = async(req,res)=>{
    try {
        const payments = await paymentSchema.find({user : req.user._id})
        .populate('booking','checkInDate checkOutDate totalAmount bookingStatus')
        .sort({createdAt : -1})

        // =========== success ==========
        res.status(200).send({message : 'success',payments})
    } 
    catch (error) {
       console.log(error)  
    }
}

const refundPayment = async(req,res)=>{
    try {
        const{id} = req.params

        const payment = await paymentSchema.findById(id)
        if(!payment) return res.status(404).send({message : 'Payment not found'})

        // ========= check access =========
        if(payment.user.toString() !== req.user._id) return res.status(401).send({message : 'Unauthorized'})

        if(payment.status !== 'paid') return res.status(400).send({message : 'Only paid payments can be refunded'})

        // ========= update payment status =========
        payment.status = 'refunded'
        await payment.save()

        // ========= update booking payment status =========
        const booking = await bookingSchema.findById(payment.booking)
        if(booking){
            booking.paymentStatus = 'refunded'
            booking.bookingStatus = 'cancelled'
            await booking.save()
        }

        // ========= successfull =========
        res.status(200).send({message : 'Payment refunded.',payment})

    } 
    catch (error) {
      console.log(error)    
    }
}

module.exports = {createPayment,getPaymentByBooking,getMyPayments,refundPayment}
