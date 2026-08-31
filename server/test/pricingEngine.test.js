const test = require('node:test')
const assert = require('node:assert/strict')

const {
    quoteStay,
    quoteShortTerm,
    quoteMidTerm,
    quoteLongTerm,
    refundForCancellation,
    validateStay,
    splitTerm,
    nightsBetween,
    effectiveMonths,
    MID_TERM_MIN_NIGHTS,
} = require('../sevices/pricingEngine')

const d = (value) => new Date(value)

const property = {
    rentalTypes: ['short', 'mid', 'long'],
    pricePerNight: 100,
    monthlyRate: 3000,
    longTermRent: 2400,
    cleaningFee: 40,
    serviceFee: 20,
    securityDeposit: 3000,
    taxRatePercent: 10,
    currency: 'USD',
    cancellationPolicy: 'moderate',
    discounts: { weekly: 10, monthly: 25 },
    minStayNights: 1,
    maxStayNights: 29,
    minStayMonths: 1,
    maxStayMonths: 11,
    minTermMonths: 12,
}

// ====== Duration
test('a night is a slept night, not a calendar day', () => {
    assert.equal(nightsBetween(d('2026-09-01'), d('2026-09-02')), 1)
    assert.equal(nightsBetween(d('2026-09-01'), d('2026-09-30')), 29)
})

test('splitTerm counts whole calendar months and leftover days', () => {
    assert.deepEqual(splitTerm(d('2026-10-01'), d('2026-11-01')), { months: 1, extraDays: 0 })
    assert.deepEqual(splitTerm(d('2026-10-12'), d('2027-01-05')), { months: 2, extraDays: 24 })
    // A stay inside one month is zero whole months
    assert.deepEqual(splitTerm(d('2026-09-01'), d('2026-09-30')), { months: 0, extraDays: 29 })
})

test('effectiveMonths counts a part month so 30 nights is about one month', () => {
    assert.ok(effectiveMonths(d('2026-10-01'), d('2026-10-31')) >= 0.99)
})

// ====== Short term
test('short term prices per night and is paid once', () => {
    const quote = quoteShortTerm(property, d('2026-09-07'), d('2026-09-10'))
    assert.equal(quote.nights, 3)
    assert.equal(quote.billingCycle, 'upfront')
    assert.equal(quote.dueNow, quote.totalAmount)
    assert.equal(quote.schedule.length, 0)
    // 300 stay + 40 cleaning = 340 taxable, +10% tax, +20 service
    assert.equal(quote.taxAmount, 34)
    assert.equal(quote.totalAmount, 394)
})

test('a seasonal rule beats a weekday rule of lower priority', () => {
    const rules = [
        { name: 'Weekend', daysOfWeek: [5, 6], nightlyRate: 150, priority: 1, isActive: true },
        { name: 'New Year', startDate: d('2026-12-28'), endDate: d('2027-01-02'), nightlyRate: 300, priority: 5, isActive: true },
    ]
    const weekend = quoteShortTerm(property, d('2026-09-11'), d('2026-09-14'), rules)
    assert.deepEqual(weekend.nightlyBreakdown.map((n) => n.rate), [150, 150, 100])

    const newYear = quoteShortTerm(property, d('2026-12-29'), d('2027-01-01'), rules)
    assert.deepEqual(newYear.nightlyBreakdown.map((n) => n.rate), [300, 300, 300])
})

test('an inactive rule is ignored', () => {
    const rules = [{ name: 'Off', daysOfWeek: [5, 6], nightlyRate: 999, priority: 9, isActive: false }]
    const quote = quoteShortTerm(property, d('2026-09-11'), d('2026-09-14'), rules)
    assert.ok(quote.nightlyBreakdown.every((n) => n.rate === 100))
})

test('length-of-stay discounts step at seven and twenty-eight nights', () => {
    assert.equal(quoteShortTerm(property, d('2026-09-01'), d('2026-09-06')).discountPercent, 0)
    assert.equal(quoteShortTerm(property, d('2026-09-01'), d('2026-09-08')).discountPercent, 10)
    assert.equal(quoteShortTerm(property, d('2026-09-01'), d('2026-09-29')).discountPercent, 25)
})

// ====== Mid term
test('mid term charges the first month now and schedules the rest', () => {
    const quote = quoteMidTerm(property, d('2026-10-01'), d('2027-01-01'))
    assert.equal(quote.months, 3)
    assert.equal(quote.billingCycle, 'monthly')
    assert.equal(quote.schedule.length, 2)
    assert.equal(quote.securityDeposit, 3000)
    assert.ok(quote.dueNow < quote.totalAmount + quote.securityDeposit)
})

test('a part month is prorated from the monthly rate without drift', () => {
    const quote = quoteMidTerm(property, d('2026-10-01'), d('2026-10-31'))
    // 30 days at 3000/month must be exactly 3000, not 2999.70
    assert.equal(quote.proratedAmount, 3000)
})

test('a stay with no whole months is settled once, never scheduled twice', () => {
    const quote = quoteMidTerm(property, d('2026-09-01'), d('2026-09-30'))
    assert.equal(quote.months, 0)
    assert.equal(quote.schedule.length, 0, 'the whole stay is due now, so nothing may be scheduled')
    const scheduled = quote.schedule.reduce((sum, item) => sum + item.amount, 0)
    assert.equal(scheduled, 0)
})

// ====== Boundaries
test('every calendar month can be booked monthly', () => {
    const wholeMonths = [
        ['2026-09-01', '2026-09-30'], // 30 day month
        ['2027-04-01', '2027-04-30'],
        ['2026-10-01', '2026-10-31'], // 31 day month
        ['2027-02-01', '2027-03-01'], // February, leaving on the 1st
    ]
    for (const [from, to] of wholeMonths) {
        assert.equal(validateStay(property, 'mid', d(from), d(to)), null, `${from} to ${to} should be bookable`)
    }
})

test('a short stay is refused from the monthly tab with the date that would work', () => {
    const error = validateStay(property, 'mid', d('2026-09-01'), d('2026-09-20'))
    assert.match(error, new RegExp(`${MID_TERM_MIN_NIGHTS} nights`))
    assert.match(error, /Check out on/)
})

test('the short-term tab refuses a stay that belongs on the monthly one', () => {
    const error = validateStay(property, 'short', d('2026-09-01'), d('2026-10-11'))
    assert.match(error, /cannot exceed 29 nights/)
})

test('a horizon the listing does not offer is refused', () => {
    const nightlyOnly = { ...property, rentalTypes: ['short'] }
    assert.match(validateStay(nightlyOnly, 'mid', d('2026-10-01'), d('2026-12-01')), /not offered/)
})

// ====== Long term
test('a lease bills one invoice per month of its term', () => {
    const quote = quoteLongTerm(property, d('2026-10-01'), 12)
    assert.equal(quote.schedule.length, 12)
    assert.equal(quote.totalContractValue, 2400 * 12)
    assert.equal(quote.dueNow, 2400 + 3000)
    assert.equal(quote.endDate.getFullYear(), 2027)
})

// ====== Refunds
test('the moderate policy steps down with notice', () => {
    const booking = { checkInDate: null, totalAmount: 500, securityDeposit: 0 }
    const at = (days) => {
        const checkIn = new Date()
        checkIn.setDate(checkIn.getDate() + days)
        return refundForCancellation({ ...booking, checkInDate: checkIn }, property)
    }
    assert.equal(at(10).refundPercent, 100)
    assert.equal(at(3).refundPercent, 50)
    assert.equal(at(0).refundPercent, 0)
})

test('a stricter policy returns less at the same notice', () => {
    const checkIn = new Date()
    checkIn.setDate(checkIn.getDate() + 10)
    const booking = { checkInDate: checkIn, totalAmount: 500, securityDeposit: 0 }

    assert.equal(refundForCancellation(booking, { cancellationPolicy: 'flexible' }).refundPercent, 100)
    assert.equal(refundForCancellation(booking, { cancellationPolicy: 'strict' }).refundPercent, 50)
    assert.equal(refundForCancellation(booking, { cancellationPolicy: 'non_refundable' }).refundPercent, 0)
})

test('the security deposit always comes back, whatever the policy says', () => {
    const checkIn = new Date()
    const booking = { checkInDate: checkIn, totalAmount: 3500, securityDeposit: 3000 }
    const refund = refundForCancellation(booking, { cancellationPolicy: 'non_refundable' })
    assert.equal(refund.refundPercent, 0)
    assert.equal(refund.refundAmount, 3000, 'nothing of the stay, all of the deposit')
})

test('quoteStay routes to the right horizon', () => {
    assert.equal(quoteStay(property, 'short', d('2026-09-01'), d('2026-09-04')).rentalType, 'short')
    assert.equal(quoteStay(property, 'mid', d('2026-10-01'), d('2026-12-01')).rentalType, 'mid')
})
