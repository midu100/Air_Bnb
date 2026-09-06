const couponSchema = require("../models/couponSchema")
const bookingSchema = require("../models/bookingSchema")

// ====== Coupon rules
// One place decides whether a code applies, so the preview a guest sees at
// checkout and the discount actually charged can never disagree.

const round2 = (value) => Math.round(value * 100) / 100

/**
 * Work out what a code is worth on one stay.
 *
 * Returns { ok: false, reason } rather than throwing, because "this code does
 * not apply" is an answer the guest should read, not a server error.
 */
const evaluateCoupon = async ({ code, userId, property, rentalType, nights, amount }) => {
    if (!code || typeof code !== 'string') return { ok: false, reason: 'Enter a coupon code' }

    const coupon = await couponSchema.findOne({ code: code.trim().toUpperCase() })
    if (!coupon) return { ok: false, reason: 'That code does not exist' }
    if (!coupon.isActive) return { ok: false, reason: 'That code is no longer active' }

    const now = new Date()
    if (coupon.validFrom && now < coupon.validFrom) {
        return { ok: false, reason: `That code starts on ${new Date(coupon.validFrom).toDateString()}` }
    }
    if (coupon.validUntil && now > coupon.validUntil) {
        return { ok: false, reason: 'That code has expired' }
    }

    // ====== Scope
    if (coupon.properties?.length && !coupon.properties.some(id => String(id) === String(property._id))) {
        return { ok: false, reason: 'That code does not apply to this property' }
    }
    if (coupon.rentalTypes?.length && !coupon.rentalTypes.includes(rentalType)) {
        return { ok: false, reason: 'That code does not apply to this kind of stay' }
    }

    // ====== Conditions
    if (coupon.minNights && nights < coupon.minNights) {
        return { ok: false, reason: `That code needs a stay of at least ${coupon.minNights} nights` }
    }
    if (coupon.minAmount && amount < coupon.minAmount) {
        return { ok: false, reason: `That code needs a booking of at least $${coupon.minAmount}` }
    }

    // ====== Usage
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
        return { ok: false, reason: 'That code has been fully redeemed' }
    }
    if (userId && coupon.maxUsesPerUser > 0) {
        const mine = await bookingSchema.countDocuments({
            guest: userId,
            coupon: coupon._id,
            bookingStatus: { $ne: 'cancelled' },
        })
        if (mine >= coupon.maxUsesPerUser) {
            return { ok: false, reason: 'You have already used that code' }
        }
    }

    // ====== Worth
    let discount = coupon.discountType === 'percentage'
        ? round2(amount * (coupon.value / 100))
        : round2(coupon.value)

    if (coupon.maxDiscount > 0) discount = Math.min(discount, coupon.maxDiscount)
    // Never discount more than the stay is worth
    discount = round2(Math.min(discount, amount))

    return {
        ok: true,
        coupon,
        discount,
        label: coupon.discountType === 'percentage' ? `${coupon.value}% off` : `$${coupon.value} off`,
    }
}

/** Count a redemption once the booking exists. */
const redeemCoupon = async (couponId) => {
    await couponSchema.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } })
}

/** Hand a use back when a booking that carried the code is cancelled. */
const releaseCoupon = async (couponId) => {
    await couponSchema.findOneAndUpdate(
        { _id: couponId, usedCount: { $gt: 0 } },
        { $inc: { usedCount: -1 } }
    )
}

module.exports = { evaluateCoupon, redeemCoupon, releaseCoupon }
