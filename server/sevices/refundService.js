const paymentSchema = require("../models/paymentSchema")
const payoutSchema = require("../models/payoutSchema")
const installmentSchema = require("../models/installmentSchema")
const getStripe = require("./stripeConfig")

// ====== The one path money takes on its way back out
// Cancelling and refunding used to be two unrelated code paths: cancelling worked
// out a policy refund and never sent it, while refunding sent the whole charge back
// and ignored the policy entirely. Both now go through here.

const round2 = (value) => Math.round(value * 100) / 100

/**
 * Refund a booking's payment, at most `amount`, and unwind everything that
 * depended on the money staying put.
 *
 * Returns { refunded, amount, reason } rather than throwing, so a caller can
 * report an honest partial outcome instead of failing the whole cancellation.
 */
const refundBookingPayment = async (booking, amount) => {
    const payment = await paymentSchema.findOne({ booking: booking._id, status: 'paid' })

    if (!payment) return { refunded: false, amount: 0, reason: 'No captured payment to refund' }
    if (amount <= 0) return { refunded: false, amount: 0, reason: 'Policy allows no refund' }

    // Never send back more than was taken
    const refundable = round2(Math.min(amount, payment.amount))
    const stripe = getStripe()

    if (stripe && payment.paymentMethod === 'stripe' && payment.transactionId) {
        try {
            await stripe.refunds.create({
                payment_intent: payment.transactionId,
                // Amount is explicit. Omitting it refunds the entire charge, which is
                // what silently defeated every cancellation policy.
                amount: Math.round(refundable * 100),
            })
        } catch (error) {
            console.log(error)
            return { refunded: false, amount: 0, reason: error?.message || 'Gateway refused the refund' }
        }
    }

    // A partial refund leaves the payment partly earned, so record which it was
    payment.status = refundable >= payment.amount ? 'refunded' : 'partially_refunded'
    payment.refundedAmount = refundable
    payment.refundedAt = new Date()
    await payment.save()

    await reversePayoutsFor(booking._id)

    return { refunded: true, amount: refundable, reason: null }
}

/**
 * Stop a host being paid for a stay that is no longer happening.
 *
 * A payout is scheduled the moment a guest pays and released a day after
 * check-in. Nothing used to cancel it, so a refunded booking still paid the host
 * and the platform lost the money twice.
 */
const reversePayoutsFor = async (bookingId) => {
    const result = await payoutSchema.updateMany(
        { booking: bookingId, status: { $in: ['scheduled', 'released'] } },
        { $set: { status: 'reversed', failureReason: 'Booking cancelled or refunded' } }
    )
    return result.modifiedCount
}

/** Nothing further should ever be charged on a stay that has ended early. */
const cancelInstallmentsFor = async (bookingId) => {
    const result = await installmentSchema.updateMany(
        { booking: bookingId, status: { $in: ['upcoming', 'due', 'failed'] } },
        { $set: { status: 'cancelled' } }
    )
    return result.modifiedCount
}

module.exports = { refundBookingPayment, reversePayoutsFor, cancelInstallmentsFor }
