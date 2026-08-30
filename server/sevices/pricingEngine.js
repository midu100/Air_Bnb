// ====== Pricing engine
// One place that knows how each rental horizon turns dates into money.
// Short term is priced per night and paid once. Mid term is priced per month,
// prorated at the edges, and billed month by month. Long term is a lease and
// is quoted, not booked - the tenancy schedule is built in leaseController.

const DAY_MS = 1000 * 60 * 60 * 24

// ====== Refund tiers, as a percent of the stay total, by days before check-in
const CANCELLATION_POLICIES = {
    flexible:       [{ daysBefore: 1,  refundPercent: 100 }, { daysBefore: 0, refundPercent: 0 }],
    moderate:       [{ daysBefore: 5,  refundPercent: 100 }, { daysBefore: 1, refundPercent: 50 }, { daysBefore: 0, refundPercent: 0 }],
    strict:         [{ daysBefore: 14, refundPercent: 100 }, { daysBefore: 7, refundPercent: 50 }, { daysBefore: 0, refundPercent: 0 }],
    non_refundable: [{ daysBefore: 0,  refundPercent: 0 }],
}

const round2 = (value) => Math.round(value * 100) / 100

// ====== Whole calendar months between two dates, plus any leftover days
const splitTerm = (checkIn, checkOut) => {
    let months = 0
    const cursor = new Date(checkIn)

    while (true) {
        const next = new Date(cursor)
        next.setMonth(next.getMonth() + 1)
        if (next > checkOut) break
        months++
        cursor.setTime(next.getTime())
    }

    const extraDays = Math.max(0, Math.round((checkOut - cursor) / DAY_MS))
    return { months, extraDays }
}

const nightsBetween = (checkIn, checkOut) => Math.ceil((checkOut - checkIn) / DAY_MS)

// Whole calendar months undercount a stay like 1 Oct - 31 Oct, which is 30 nights
// but zero whole months. Minimum stay has to measure the real duration.
const effectiveMonths = (checkIn, checkOut) => {
    const { months, extraDays } = splitTerm(checkIn, checkOut)
    return months + extraDays / 30
}

// ====== Does a rule cover this particular night?
const ruleCoversDate = (rule, date) => {
    if (rule.isActive === false) return false
    if (rule.startDate && date < new Date(rule.startDate)) return false
    if (rule.endDate && date > new Date(rule.endDate)) return false
    if (rule.daysOfWeek?.length && !rule.daysOfWeek.includes(date.getDay())) return false
    return true
}

// ====== The rate for one night, after any seasonal or weekday override
const rateForNight = (property, rules, date) => {
    const matching = (rules || [])
        .filter(rule => rule.nightlyRate && ruleCoversDate(rule, date))
        .sort((a, b) => (b.priority || 0) - (a.priority || 0))

    return matching.length ? matching[0].nightlyRate : property.pricePerNight
}

// ====== Which discount tier a nightly stay earns
const nightlyDiscountPercent = (property, nights) => {
    const discounts = property.discounts || {}
    if (nights >= 28 && discounts.monthly > 0) return discounts.monthly
    if (nights >= 7 && discounts.weekly > 0) return discounts.weekly
    return 0
}

// ====== Short term - pay the whole stay up front
const quoteShortTerm = (property, checkIn, checkOut, rules = []) => {
    const nights = nightsBetween(checkIn, checkOut)

    // Price night by night so a weekend or a season shows up in the total
    const nightlyBreakdown = []
    let gross = 0
    const cursor = new Date(checkIn)
    for (let index = 0; index < nights; index++) {
        const rate = rateForNight(property, rules, cursor)
        nightlyBreakdown.push({ date: new Date(cursor), rate })
        gross += rate
        cursor.setDate(cursor.getDate() + 1)
    }
    gross = round2(gross)

    const discountPercent = nightlyDiscountPercent(property, nights)
    const discountAmount = round2(gross * (discountPercent / 100))
    const cleaningFee = property.cleaningFee || 0
    const serviceFee = property.serviceFee || 0

    const taxable = round2(gross - discountAmount + cleaningFee)
    const taxRatePercent = property.taxRatePercent || 0
    const taxAmount = round2(taxable * (taxRatePercent / 100))

    const totalAmount = round2(taxable + serviceFee + taxAmount)
    const averageNightlyRate = nights > 0 ? round2(gross / nights) : property.pricePerNight

    return {
        rentalType: 'short',
        currency: property.currency || 'USD',
        nights,
        months: 0,
        pricePerNight: property.pricePerNight,
        averageNightlyRate,
        nightlyBreakdown,
        monthlyRate: null,
        discountPercent,
        discountAmount,
        cleaningFee,
        serviceFee,
        taxRatePercent,
        taxAmount,
        securityDeposit: 0,
        totalAmount,
        dueNow: totalAmount,
        billingCycle: 'upfront',
        cancellationPolicy: property.cancellationPolicy || 'moderate',
        schedule: [],
    }
}

// ====== Mid term - first month and deposit now, the rest charged monthly
const quoteMidTerm = (property, checkIn, checkOut, rules = []) => {
    const nights = nightsBetween(checkIn, checkOut)
    const { months, extraDays } = splitTerm(checkIn, checkOut)

    // A seasonal rule may override the monthly rate too
    const monthlyOverride = (rules || [])
        .filter(rule => rule.monthlyRate && ruleCoversDate(rule, checkIn))
        .sort((a, b) => (b.priority || 0) - (a.priority || 0))[0]
    const monthlyRate = monthlyOverride ? monthlyOverride.monthlyRate : property.monthlyRate

    const dailyRate = round2(monthlyRate / 30)
    // Derive from the monthly rate directly - rounding the daily rate first and then
    // multiplying drifts, so exactly 30 days would bill $1899.90 instead of $1900.
    const proratedAmount = round2((monthlyRate * extraDays) / 30)
    const gross = round2(months * monthlyRate + proratedAmount)

    const cleaningFee = property.cleaningFee || 0
    const serviceFee = property.serviceFee || 0
    const securityDeposit = property.securityDeposit || 0

    const taxable = round2(gross + cleaningFee)
    const taxRatePercent = property.taxRatePercent || 0
    const taxAmount = round2(taxable * (taxRatePercent / 100))
    const totalAmount = round2(taxable + serviceFee + taxAmount)

    // ====== Charge dates, one per month after the first
    const schedule = []
    for (let index = 1; index < months; index++) {
        const dueDate = new Date(checkIn)
        dueDate.setMonth(dueDate.getMonth() + index)
        schedule.push({ dueDate, amount: monthlyRate })
    }
    // With no whole months the prorated amount is the whole stay and is due now,
    // so scheduling it again would charge the guest twice.
    if (extraDays > 0 && months > 0) {
        const dueDate = new Date(checkIn)
        dueDate.setMonth(dueDate.getMonth() + months)
        schedule.push({ dueDate, amount: proratedAmount, prorated: true, days: extraDays })
    }

    const firstCharge = months > 0 ? monthlyRate : proratedAmount
    const dueNow = round2(firstCharge + cleaningFee + serviceFee + taxAmount + securityDeposit)

    return {
        rentalType: 'mid',
        currency: property.currency || 'USD',
        nights,
        months,
        extraDays,
        pricePerNight: property.pricePerNight,
        monthlyRate,
        dailyRate,
        proratedAmount,
        discountPercent: 0,
        discountAmount: 0,
        cleaningFee,
        serviceFee,
        taxRatePercent,
        taxAmount,
        securityDeposit,
        utilitiesIncluded: !!property.utilitiesIncluded,
        utilityCap: property.utilityCap || null,
        totalAmount,
        dueNow,
        billingCycle: 'monthly',
        cancellationPolicy: property.cancellationPolicy || 'moderate',
        schedule,
    }
}

// ====== Long term - a lease quote, not a reservation
const quoteLongTerm = (property, startDate, months) => {
    const monthlyRent = property.longTermRent
    const securityDeposit = property.securityDeposit || 0

    const schedule = []
    for (let index = 0; index < months; index++) {
        const dueDate = new Date(startDate)
        dueDate.setMonth(dueDate.getMonth() + index)
        schedule.push({ dueDate, amount: monthlyRent })
    }

    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + months)

    return {
        rentalType: 'long',
        currency: property.currency || 'USD',
        months,
        startDate,
        endDate,
        monthlyRent,
        securityDeposit,
        utilitiesIncluded: !!property.utilitiesIncluded,
        totalContractValue: round2(monthlyRent * months),
        dueNow: round2(monthlyRent + securityDeposit),
        billingCycle: 'monthly',
        schedule,
    }
}

// ====== What a guest gets back if they cancel now
const refundForCancellation = (booking, property, cancelledAt = new Date()) => {
    const policyName = property?.cancellationPolicy || booking.cancellationPolicy || 'moderate'
    const tiers = CANCELLATION_POLICIES[policyName] || CANCELLATION_POLICIES.moderate

    const daysBefore = Math.floor((new Date(booking.checkInDate) - cancelledAt) / DAY_MS)

    // Tiers are ordered most generous first
    const tier = tiers.find(item => daysBefore >= item.daysBefore) || { refundPercent: 0 }

    // Fees for work not yet done come back, the security deposit always does
    const stayValue = Math.max(0, (booking.totalAmount || 0) - (booking.securityDeposit || 0))
    const refundAmount = round2(stayValue * (tier.refundPercent / 100) + (booking.securityDeposit || 0))

    return {
        policy: policyName,
        daysBeforeCheckIn: daysBefore,
        refundPercent: tier.refundPercent,
        refundAmount,
        forfeitedAmount: round2((booking.totalAmount || 0) - refundAmount),
    }
}

// ====== Guard rails - returns an error message, or null when the stay is allowed
const validateStay = (property, rentalType, checkIn, checkOut) => {
    if (!property.rentalTypes?.includes(rentalType)) {
        return 'This property is not offered for that rental type'
    }

    const nights = nightsBetween(checkIn, checkOut)

    if (rentalType === 'short') {
        if (!property.pricePerNight) return 'This property has no nightly rate'
        if (nights < (property.minStayNights || 1)) return `Minimum stay is ${property.minStayNights || 1} night(s)`
        if (nights > (property.maxStayNights || 29)) return `Short-term stays cannot exceed ${property.maxStayNights || 29} nights. Try a monthly stay.`
    }

    if (rentalType === 'mid') {
        if (!property.monthlyRate) return 'This property has no monthly rate'
        // 30 nights is where most cities stop calling it a short-term rental
        if (nights < 30) return 'Monthly stays must be at least 30 nights'
        const { months } = splitTerm(checkIn, checkOut)
        const duration = effectiveMonths(checkIn, checkOut)
        const minMonths = property.minStayMonths || 1

        // Tiny epsilon so 30 nights is not rejected by floating point
        if (duration < minMonths - 0.01) return `Minimum stay is ${minMonths} month(s)`
        if (months > (property.maxStayMonths || 11)) return `Monthly stays cannot exceed ${property.maxStayMonths || 11} months. Try a long-term lease.`
    }

    return null
}

const quoteStay = (property, rentalType, checkIn, checkOut, rules = []) => {
    return rentalType === 'mid'
        ? quoteMidTerm(property, checkIn, checkOut, rules)
        : quoteShortTerm(property, checkIn, checkOut, rules)
}

module.exports = {
    quoteStay,
    quoteShortTerm,
    quoteMidTerm,
    quoteLongTerm,
    refundForCancellation,
    validateStay,
    splitTerm,
    nightsBetween,
    effectiveMonths,
    rateForNight,
    CANCELLATION_POLICIES,
}
