const bookingSchema = require("../models/bookingSchema")
const propertySchema = require("../models/propertySchema")
const payoutSchema = require("../models/payoutSchema")
const rentInvoiceSchema = require("../models/rentInvoiceSchema")
const leaseSchema = require("../models/leaseSchema")
const availabilitySchema = require("../models/availabilitySchema")

// ====== Portfolio maths
// Every number the assistant quotes comes from here, so a figure in chat and a
// figure on the dashboard can never disagree.

const DAY_MS = 1000 * 60 * 60 * 24
const round2 = (value) => Math.round(value * 100) / 100
const pct = (part, whole) => (whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0)

const daysBetween = (from, to) => Math.max(0, Math.round((to - from) / DAY_MS))

/** Nights of a booking that fall inside a window, so a stay spanning the edge counts fairly. */
const nightsInWindow = (booking, from, to) => {
    const start = new Date(Math.max(new Date(booking.checkInDate), from))
    const end = new Date(Math.min(new Date(booking.checkOutDate), to))
    return daysBetween(start, end)
}

/**
 * Profit and loss per property over a window.
 *
 * Revenue is what guests actually paid, less anything refunded. Costs are the
 * platform's commission, the cleaning the host pays out, and tax that is
 * collected on behalf of an authority and was never the host's money.
 */
const propertyPerformance = async (hostId, { from, to } = {}) => {
    const windowTo = to ? new Date(to) : new Date()
    const windowFrom = from ? new Date(from) : new Date(windowTo.getTime() - 90 * DAY_MS)
    const windowNights = daysBetween(windowFrom, windowTo)

    const properties = await propertySchema.find({ host: hostId })
    if (!properties.length) return { window: { from: windowFrom, to: windowTo }, properties: [], portfolio: null }

    const propertyIds = properties.map((item) => item._id)

    const bookings = await bookingSchema.find({
        property: { $in: propertyIds },
        checkInDate: { $lt: windowTo },
        checkOutDate: { $gt: windowFrom },
        bookingStatus: { $ne: 'cancelled' },
    })

    const leases = await leaseSchema.find({ property: { $in: propertyIds }, status: { $in: ['active', 'notice_given', 'ended'] } })
    const leaseIds = leases.map((item) => item._id)

    const paidRent = await rentInvoiceSchema.find({
        lease: { $in: leaseIds },
        status: 'paid',
        dueDate: { $gte: windowFrom, $lte: windowTo },
    })

    const payouts = await payoutSchema.find({ host: hostId, createdAt: { $gte: windowFrom, $lte: windowTo } })

    const blocks = await availabilitySchema.find({
        property: { $in: propertyIds },
        startDate: { $lt: windowTo },
        endDate: { $gt: windowFrom },
    })

    const rows = properties.map((property) => {
        const own = bookings.filter((item) => String(item.property) === String(property._id))
        const paidOwn = own.filter((item) => item.paymentStatus === 'paid')

        const grossRevenue = round2(paidOwn.reduce((sum, item) => sum + (item.totalAmount || 0), 0))
        const refunded = round2(paidOwn.reduce((sum, item) => sum + (item.refundAmount || 0), 0))
        const taxCollected = round2(paidOwn.reduce((sum, item) => sum + (item.taxAmount || 0), 0))
        const cleaningCost = round2(paidOwn.reduce((sum, item) => sum + (item.cleaningFee || 0), 0))
        const couponGiven = round2(paidOwn.reduce((sum, item) => sum + (item.couponDiscount || 0), 0))

        const ownLeaseIds = leases.filter((item) => String(item.property) === String(property._id)).map((item) => String(item._id))
        const rentRevenue = round2(paidRent.filter((item) => ownLeaseIds.includes(String(item.lease))).reduce((sum, item) => sum + (item.amount || 0), 0))

        const ownPayouts = payouts.filter((item) => own.some((booking) => String(booking._id) === String(item.booking)))
        const platformFee = round2(ownPayouts.reduce((sum, item) => sum + (item.platformFee || 0), 0))

        // Nights actually sold, and nights the host took off the market
        const soldNights = own.reduce((sum, item) => sum + nightsInWindow(item, windowFrom, windowTo), 0)
        const blockedNights = blocks
            .filter((item) => String(item.property) === String(property._id))
            .reduce((sum, item) => sum + nightsInWindow({ checkInDate: item.startDate, checkOutDate: item.endDate }, windowFrom, windowTo), 0)

        const bookableNights = Math.max(0, windowNights - blockedNights)

        // Tax was never the host's money, so it leaves before profit
        const netRevenue = round2(grossRevenue + rentRevenue - refunded - taxCollected)
        const netProfit = round2(netRevenue - platformFee - cleaningCost)

        return {
            propertyId: String(property._id),
            title: property.title,
            city: property.city,
            country: property.country,
            rentalTypes: property.rentalTypes || [],
            status: property.status,
            pricePerNight: property.pricePerNight,
            monthlyRate: property.monthlyRate || null,
            longTermRent: property.longTermRent || null,

            bookings: own.length,
            paidBookings: paidOwn.length,
            soldNights,
            blockedNights,
            bookableNights,
            occupancyPercent: pct(soldNights, bookableNights),

            grossRevenue,
            rentRevenue,
            refunded,
            couponGiven,
            taxCollected,
            platformFee,
            cleaningCost,
            netRevenue,
            netProfit,

            // What a night actually earned, and what each available night earned
            adr: soldNights > 0 ? round2(grossRevenue / soldNights) : 0,
            revPar: bookableNights > 0 ? round2(netRevenue / bookableNights) : 0,
        }
    })

    rows.sort((a, b) => b.netProfit - a.netProfit)

    const portfolio = {
        properties: rows.length,
        netProfit: round2(rows.reduce((sum, item) => sum + item.netProfit, 0)),
        netRevenue: round2(rows.reduce((sum, item) => sum + item.netRevenue, 0)),
        platformFee: round2(rows.reduce((sum, item) => sum + item.platformFee, 0)),
        soldNights: rows.reduce((sum, item) => sum + item.soldNights, 0),
        bookableNights: rows.reduce((sum, item) => sum + item.bookableNights, 0),
        bestPerformer: rows[0] ? { title: rows[0].title, netProfit: rows[0].netProfit } : null,
        worstPerformer: rows.length > 1 ? { title: rows[rows.length - 1].title, netProfit: rows[rows.length - 1].netProfit } : null,
    }
    portfolio.occupancyPercent = pct(portfolio.soldNights, portfolio.bookableNights)

    return { window: { from: windowFrom, to: windowTo, nights: windowNights }, properties: rows, portfolio }
}

/**
 * Empty stretches ahead, which is what a promotion is aimed at.
 *
 * Also reports how far ahead this property normally books, because a campaign
 * launched after that lead time has already missed the guests it wanted.
 */
const findGaps = async (hostId, { daysAhead = 90, minGapNights = 3 } = {}) => {
    const now = new Date()
    const horizon = new Date(now.getTime() + daysAhead * DAY_MS)

    const properties = await propertySchema.find({ host: hostId, status: 'published' })
    const results = []

    for (const property of properties) {
        const bookings = await bookingSchema.find({
            property: property._id,
            checkOutDate: { $gte: now },
            checkInDate: { $lte: horizon },
            $or: [{ bookingStatus: 'confirmed' }, { bookingStatus: 'pending', expiresAt: { $gt: now } }],
        }).sort({ checkInDate: 1 })

        const blocks = await availabilitySchema.find({
            property: property._id,
            endDate: { $gte: now },
            startDate: { $lte: horizon },
        }).sort({ startDate: 1 })

        // Treat a booking and a host block the same - both make a night unsellable
        const taken = [
            ...bookings.map((item) => ({ from: new Date(item.checkInDate), to: new Date(item.checkOutDate) })),
            ...blocks.map((item) => ({ from: new Date(item.startDate), to: new Date(item.endDate) })),
        ].sort((a, b) => a.from - b.from)

        const gaps = []
        let cursor = new Date(now)
        for (const span of taken) {
            if (span.from > cursor) {
                const nights = daysBetween(cursor, span.from)
                if (nights >= minGapNights) gaps.push({ from: new Date(cursor), to: new Date(span.from), nights })
            }
            if (span.to > cursor) cursor = new Date(span.to)
        }
        if (horizon > cursor) {
            const nights = daysBetween(cursor, horizon)
            if (nights >= minGapNights) gaps.push({ from: new Date(cursor), to: new Date(horizon), nights })
        }

        // How far ahead guests actually book this place
        const past = await bookingSchema.find({ property: property._id, bookingStatus: { $ne: 'cancelled' } })
            .select('createdAt checkInDate').limit(50)
        const leadTimes = past
            .map((item) => daysBetween(new Date(item.createdAt), new Date(item.checkInDate)))
            .filter((value) => value >= 0)
        const averageLeadDays = leadTimes.length
            ? Math.round(leadTimes.reduce((sum, value) => sum + value, 0) / leadTimes.length)
            : null

        results.push({
            propertyId: String(property._id),
            title: property.title,
            pricePerNight: property.pricePerNight,
            emptyNights: gaps.reduce((sum, item) => sum + item.nights, 0),
            averageLeadDays,
            gaps: gaps.slice(0, 6).map((item) => ({
                from: item.from.toISOString().slice(0, 10),
                to: item.to.toISOString().slice(0, 10),
                nights: item.nights,
                // Launch by this date or the guests who book this far out are already gone
                promoteBy: averageLeadDays
                    ? new Date(item.from.getTime() - averageLeadDays * DAY_MS).toISOString().slice(0, 10)
                    : null,
            })),
        })
    }

    results.sort((a, b) => b.emptyNights - a.emptyNights)
    return { daysAhead, properties: results }
}

/** Revenue split by month and by horizon, for trend questions. */
const revenueBreakdown = async (hostId, { months = 6 } = {}) => {
    const now = new Date()
    const from = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)

    const properties = await propertySchema.find({ host: hostId }).select('_id title')
    const propertyIds = properties.map((item) => item._id)

    const bookings = await bookingSchema.find({
        property: { $in: propertyIds },
        paymentStatus: 'paid',
        checkInDate: { $gte: from },
    })

    const buckets = {}
    for (const booking of bookings) {
        const key = new Date(booking.checkInDate).toISOString().slice(0, 7)
        if (!buckets[key]) buckets[key] = { month: key, short: 0, mid: 0, total: 0, bookings: 0 }
        const net = round2((booking.totalAmount || 0) - (booking.refundAmount || 0) - (booking.taxAmount || 0))
        buckets[key][booking.rentalType === 'mid' ? 'mid' : 'short'] += net
        buckets[key].total += net
        buckets[key].bookings += 1
    }

    const series = Object.values(buckets)
        .map((item) => ({ ...item, short: round2(item.short), mid: round2(item.mid), total: round2(item.total) }))
        .sort((a, b) => a.month.localeCompare(b.month))

    return { months, series }
}

module.exports = { propertyPerformance, findGaps, revenueBreakdown }
