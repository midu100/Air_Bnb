const payoutSchema = require("../models/payoutSchema")
const userSchema = require("../models/authSchema")
const bookingSchema = require("../models/bookingSchema")
const getStripe = require("../sevices/stripeConfig")

// The platform's cut of every booking
const PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT || 12)

const round2 = (value) => Math.round(value * 100) / 100

// ====== Start or resume Stripe Connect onboarding
const createOnboardingLink = async(req,res)=>{
    try {
        const stripe = getStripe()
        if(!stripe) return res.status(503).send({message : 'Payment gateway is not configured'})

        const user = await userSchema.findById(req.user._id)
        if(!user) return res.status(404).send({message : 'User not found'})

        let accountId = user.stripeAccountId

        if(!accountId){
            const account = await stripe.accounts.create({
                type : 'express',
                email : user.email,
                capabilities : {
                    transfers : { requested : true },
                },
                business_type : 'individual',
            })
            accountId = account.id
            user.stripeAccountId = accountId
            await user.save()
        }

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'

        const link = await stripe.accountLinks.create({
            account : accountId,
            refresh_url : `${clientUrl}/admin/payouts?onboarding=retry`,
            return_url : `${clientUrl}/admin/payouts?onboarding=done`,
            type : 'account_onboarding',
        })

        // ========= successfull =========
        res.status(200).send({message : 'Onboarding link created.',url : link.url})

    }
    catch (error) {
      console.log(error)
      res.status(500).send({message : 'Internal server error'})
    }
}

// ====== Has Stripe cleared this host to receive money yet?
const getAccountStatus = async(req,res)=>{
    try {
        const user = await userSchema.findById(req.user._id)
        if(!user) return res.status(404).send({message : 'User not found'})

        if(!user.stripeAccountId){
            return res.status(200).send({message : 'success',status : {connected : false,payoutsEnabled : false}})
        }

        const stripe = getStripe()
        if(!stripe) return res.status(503).send({message : 'Payment gateway is not configured'})

        const account = await stripe.accounts.retrieve(user.stripeAccountId)

        // Mirror the gateway's verdict so the rest of the app can read it cheaply
        user.payoutsEnabled = !!account.payouts_enabled
        await user.save()

        // =========== success ==========
        res.status(200).send({
            message : 'success',
            status : {
                connected : true,
                payoutsEnabled : !!account.payouts_enabled,
                detailsSubmitted : !!account.details_submitted,
                requirements : account.requirements?.currently_due || [],
            }
        })
    }
    catch (error) {
       console.log(error)
       res.status(500).send({message : 'Internal server error'})
    }
}

const getMyPayouts = async(req,res)=>{
    try {
        const payouts = await payoutSchema.find({host : req.user._id})
        .populate('booking','checkInDate checkOutDate totalAmount property')
        .sort({createdAt : -1})

        const summary = payouts.reduce((totals,payout)=>{
            if(payout.status === 'paid') totals.paid += payout.netAmount
            if(['scheduled','released'].includes(payout.status)) totals.pending += payout.netAmount
            return totals
        },{paid : 0,pending : 0})

        // =========== success ==========
        res.status(200).send({message : 'success',payouts,summary : {paid : round2(summary.paid),pending : round2(summary.pending)}})
    }
    catch (error) {
       console.log(error)
       res.status(500).send({message : 'Internal server error'})
    }
}

// ====== Called once a booking is paid. Money is held until after check-in.
const schedulePayoutForBooking = async(bookingId)=>{
    try {
        const booking = await bookingSchema.findById(bookingId)
        if(!booking) return null

        const existing = await payoutSchema.findOne({booking : bookingId})
        if(existing) return existing

        // The guest's deposit is not the host's money
        const payable = Math.max(0, (booking.totalAmount || 0) - (booking.securityDeposit || 0) - (booking.taxAmount || 0))
        const platformFee = round2(payable * (PLATFORM_FEE_PERCENT / 100))

        // Released a day after check-in, so a guest can report a problem first
        const releaseDate = new Date(booking.checkInDate)
        releaseDate.setDate(releaseDate.getDate() + 1)

        return await payoutSchema.create({
            host : booking.host,
            booking : booking._id,
            grossAmount : round2(payable),
            platformFee,
            netAmount : round2(payable - platformFee),
            releaseDate,
            status : 'scheduled',
        })
    } catch (error) {
        console.log(error)
        return null
    }
}

module.exports = {createOnboardingLink,getAccountStatus,getMyPayouts,schedulePayoutForBooking,PLATFORM_FEE_PERCENT}
