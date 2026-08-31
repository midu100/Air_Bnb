const paymentSchema = require("../models/paymentSchema")
const bookingSchema = require("../models/bookingSchema")
const propertySchema = require("../models/propertySchema")
const getStripe = require("../sevices/stripeConfig")
const { refundForCancellation } = require("../sevices/pricingEngine")
const { refundBookingPayment, cancelInstallmentsFor } = require("../sevices/refundService")
const { schedulePayoutForBooking } = require("./payoutController")

// ====== Create Checkout Session - hands the guest a Stripe hosted payment page
const createCheckoutSession = async(req,res)=>{
    try {
        const{bookingId} = req.body

        if(!bookingId) return res.status(400).send({message : 'Booking id is required'})

        const stripe = getStripe()
        if(!stripe) return res.status(503).send({message : 'Payment gateway is not configured'})

        // ========= 1. booking exists? =========
        const booking = await bookingSchema.findById(bookingId).populate('property','title thumbnail')
        if(!booking) return res.status(404).send({message : 'Booking not found'})

        // ========= 2. check access =========
        if(booking.guest.toString() !== req.user._id) return res.status(403).send({message : 'Unauthorized'})

        // ========= 3. booking still payable? =========
        if(booking.paymentStatus === 'paid') return res.status(400).send({message : 'Booking already paid'})
        if(booking.bookingStatus === 'cancelled') return res.status(400).send({message : 'Cannot pay for a cancelled booking'})
        if(booking.expiresAt && booking.expiresAt < new Date()) return res.status(400).send({message : 'Payment window has expired for this booking'})

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'

        // ========= 4. create the session =========
        // The amount is read from the booking, never from the request body
        const session = await stripe.checkout.sessions.create({
            mode : 'payment',
            payment_method_types : ['card'],
            customer_email : req.user.email,
            // A monthly stay needs the card kept on file for the charges that follow
            ...(booking.billingCycle === 'monthly'
                ? { customer_creation : 'always', payment_intent_data : { setup_future_usage : 'off_session' } }
                : {}),
            line_items : [
                {
                    quantity : 1,
                    price_data : {
                        currency : 'usd',
                        unit_amount : Math.round(booking.totalAmount * 100),
                        product_data : {
                            name : booking.property?.title || 'Air-bnb stay',
                            description : `${booking.totalNights} night(s), ${booking.guestsCount} guest(s)`,
                        }
                    }
                }
            ],
            // The webhook trusts this, not anything the browser sends back
            metadata : {
                bookingId : String(booking._id),
                userId : String(req.user._id),
            },
            success_url : `${clientUrl}/my-payments?payment=success`,
            cancel_url : `${clientUrl}/my-bookings?payment=cancelled`,
        })

        // ========= successfull =========
        res.status(200).send({message : 'Checkout session created.',url : session.url})

    } 
    catch (error) {
      console.log(error)
      res.status(500).send({message : 'Internal server error'})
    }
}

// ====== Stripe Webhook - the only place a booking is marked paid
// Mounted with express.raw in index.js, req.body is a Buffer here on purpose
const stripeWebhook = async(req,res)=>{
    try {
        const stripe = getStripe()
        if(!stripe) return res.status(503).send({message : 'Payment gateway is not configured'})

        const signature = req.headers['stripe-signature']
        let event

        try {
            event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET)
        } catch (err) {
            // A bad signature means the call did not come from Stripe
            console.log(err)
            return res.status(400).send({message : 'Invalid webhook signature'})
        }

        if(event.type === 'checkout.session.completed'){
            const session = event.data.object
            const bookingId = session.metadata?.bookingId

            const booking = await bookingSchema.findById(bookingId)
            if(booking && booking.paymentStatus !== 'paid'){
                // Stripe retries webhooks, so guard against writing the payment twice
                const alreadyPaid = await paymentSchema.findOne({transactionId : session.payment_intent})

                if(!alreadyPaid){
                    await paymentSchema.create({
                        booking : booking._id,
                        user : session.metadata?.userId || booking.guest,
                        transactionId : session.payment_intent,
                        paymentMethod : 'stripe',
                        amount : session.amount_total / 100,
                        currency : (session.currency || 'usd').toUpperCase(),
                        status : 'paid'
                    })
                }

                booking.paymentStatus = 'paid'
                booking.expiresAt = null

                // Keep the customer and card so monthly installments can charge later
                if(booking.billingCycle === 'monthly' && session.customer){
                    booking.stripeCustomerId = session.customer
                    try {
                        const intent = await stripe.paymentIntents.retrieve(session.payment_intent)
                        if(intent?.payment_method) booking.stripePaymentMethodId = intent.payment_method
                    } catch (err) {
                        console.log(err)
                    }
                }
                await booking.save()

                // Hold the host's share until just after check-in
                await schedulePayoutForBooking(booking._id)
            }
        }

        res.status(200).send({received : true})

    } 
    catch (error) {
      console.log(error)
      res.status(500).send({message : 'Internal server error'})
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
        if(payment.user._id.toString() !== req.user._id) return res.status(403).send({message : 'Unauthorized'})

        // =========== success ==========
        res.status(200).send({message : 'success',payment})
    } 
    catch (error) {
       console.log(error)
       res.status(500).send({message : 'Internal server error'})
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
       res.status(500).send({message : 'Internal server error'})
    }
}

const refundPayment = async(req,res)=>{
    try {
        const{id} = req.params

        const payment = await paymentSchema.findById(id)
        if(!payment) return res.status(404).send({message : 'Payment not found'})

        // ========= check access =========
        if(payment.user.toString() !== req.user._id) return res.status(403).send({message : 'Unauthorized'})

        if(payment.status !== 'paid') return res.status(400).send({message : 'Only paid payments can be refunded'})

        const booking = await bookingSchema.findById(payment.booking)
        if(!booking) return res.status(404).send({message : 'Booking not found'})

        // ========= the policy decides how much, not the caller =========
        // Refunding here used to send the whole charge back with no policy applied,
        // so a guest could skip /booking/cancel and get everything regardless of
        // how little notice they had given.
        const property = await propertySchema.findById(booking.property)
        const refund = refundForCancellation(booking, property)

        if(refund.refundAmount <= 0){
            return res.status(400).send({
                message : `This ${refund.policy} policy returns nothing at ${refund.daysBeforeCheckIn} day(s) notice. Cancel the booking if you no longer need it.`,
                refund,
            })
        }

        const outcome = await refundBookingPayment(booking, refund.refundAmount)
        if(!outcome.refunded) return res.status(400).send({message : outcome.reason || 'The refund could not be sent'})

        // ========= the stay is over once the money goes back =========
        booking.bookingStatus = 'cancelled'
        booking.refundAmount = outcome.amount
        if(outcome.amount >= booking.totalAmount) booking.paymentStatus = 'refunded'
        await booking.save()

        await cancelInstallmentsFor(booking._id)

        const updatedPayment = await paymentSchema.findById(id)

        // ========= successfull =========
        res.status(200).send({
            message : `Refunded $${outcome.amount} under the ${refund.policy} policy (${refund.refundPercent}% at ${refund.daysBeforeCheckIn} day(s) notice).`,
            payment : updatedPayment,
            refund : { ...refund, refundedAmount : outcome.amount },
        })

    }
    catch (error) {
      console.log(error)
      res.status(500).send({message : 'Internal server error'})
    }
}

module.exports = {createCheckoutSession,stripeWebhook,getPaymentByBooking,getMyPayments,refundPayment}
