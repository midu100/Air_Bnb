const propertySchema = require("../models/propertySchema")
const bookingSchema = require("../models/bookingSchema")
const couponSchema = require("../models/couponSchema")
const pricingRuleSchema = require("../models/pricingRuleSchema")
const leaseSchema = require("../models/leaseSchema")
const rentalApplicationSchema = require("../models/rentalApplicationSchema")
const availabilitySchema = require("../models/availabilitySchema")
const analytics = require("./analyticsService")

// ====== Tool registry
//
//   kind: 'read'  - runs inside the loop, its result shapes the next round
//   kind: 'write' - NEVER runs inside the loop. The loop validates the arguments
//                   and captures a proposal; the change only happens after the
//                   host confirms, and validate() runs a second time then.
//
// Every execute() takes hostId from the session, never from the model, so a tool
// call cannot reach another host's data however the arguments are shaped.

const badRequest = (message) => {
    const error = new Error(message)
    error.status = 400
    return error
}

const reqString = (value, name, max = 200) => {
    if (typeof value !== 'string' || !value.trim()) throw badRequest(`${name} is required`)
    if (value.length > max) throw badRequest(`${name} is too long`)
    return value.trim()
}

const optString = (value, max = 500) => {
    if (value === undefined || value === null || value === '') return undefined
    if (typeof value !== 'string') throw badRequest('Expected a text value')
    return value.slice(0, max)
}

const optNumber = (value, name) => {
    if (value === undefined || value === null || value === '') return undefined
    const parsed = Number(value)
    if (!Number.isFinite(parsed)) throw badRequest(`${name} must be a number`)
    return parsed
}

const reqDate = (value, name) => {
    const date = new Date(reqString(value, name, 40))
    if (isNaN(date)) throw badRequest(`${name} must be a date like 2027-04-05`)
    return date
}

/** A host may only ever touch their own listing. */
const ownedProperty = async (hostId, propertyId) => {
    const property = await propertySchema.findOne({ _id: propertyId, host: hostId })
    if (!property) throw badRequest('That property is not one of yours')
    return property
}

const LIST_LIMIT = 40

const tools = {
    // ── Reads ───────────────────────────────────────────────────────────────
    search_properties: {
        kind: 'read',
        description:
            'Find the caller\'s listings by name, city or country. Use this first to turn a property name into an id before any other tool that needs one.',
        parameters: {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'Name or place fragment. Omit to list everything.' },
            },
        },
        validate: (args) => ({ query: optString(args?.query, 120) }),
        execute: async (hostId, { query }) => {
            const filter = { host: hostId }
            if (query) {
                const safe = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                filter.$or = [
                    { title: { $regex: safe, $options: 'i' } },
                    { city: { $regex: safe, $options: 'i' } },
                    { country: { $regex: safe, $options: 'i' } },
                ]
            }
            const properties = await propertySchema.find(filter).limit(LIST_LIMIT)
            return properties.map((item) => ({
                id: String(item._id),
                title: item.title,
                city: item.city,
                country: item.country,
                status: item.status,
                rentalTypes: item.rentalTypes,
                pricePerNight: item.pricePerNight,
                monthlyRate: item.monthlyRate || null,
                longTermRent: item.longTermRent || null,
            }))
        },
    },

    property_performance: {
        kind: 'read',
        description:
            'Profit and loss per listing over a window: occupancy, ADR, RevPAR, net revenue and net profit after platform fee, cleaning and tax. Use this for any question about which property earns most or least, or how the portfolio is doing.',
        parameters: {
            type: 'object',
            properties: {
                days: { type: 'number', description: 'How many days back to measure. Defaults to 90.' },
            },
        },
        validate: (args) => {
            const days = optNumber(args?.days, 'days') || 90
            if (days < 1 || days > 730) throw badRequest('days must be between 1 and 730')
            return { days }
        },
        execute: async (hostId, { days }) => {
            const to = new Date()
            const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000)
            const result = await analytics.propertyPerformance(hostId, { from, to })
            return {
                windowDays: days,
                portfolio: result.portfolio,
                properties: result.properties.map(({ propertyId, title, occupancyPercent, adr, revPar, netRevenue, netProfit, platformFee, soldNights, bookableNights, pricePerNight, status }) => ({
                    propertyId, title, occupancyPercent, adr, revPar, netRevenue, netProfit, platformFee, soldNights, bookableNights, pricePerNight, status,
                })),
            }
        },
    },

    find_empty_dates: {
        kind: 'read',
        description:
            'Empty stretches on the calendar ahead, with how far in advance each listing normally books and the date a promotion would need to launch by to still reach those guests. Use this to decide when to run a discount campaign.',
        parameters: {
            type: 'object',
            properties: {
                days: { type: 'number', description: 'How far ahead to look. Defaults to 90.' },
                minNights: { type: 'number', description: 'Ignore gaps shorter than this. Defaults to 3.' },
            },
        },
        validate: (args) => ({
            days: optNumber(args?.days, 'days') || 90,
            minNights: optNumber(args?.minNights, 'minNights') || 3,
        }),
        execute: async (hostId, { days, minNights }) =>
            analytics.findGaps(hostId, { daysAhead: days, minGapNights: minNights }),
    },

    revenue_trend: {
        kind: 'read',
        description: 'Net revenue by month, split between nightly and monthly stays. Use for trend and growth questions.',
        parameters: {
            type: 'object',
            properties: { months: { type: 'number', description: 'How many months back. Defaults to 6.' } },
        },
        validate: (args) => ({ months: optNumber(args?.months, 'months') || 6 }),
        execute: async (hostId, { months }) => analytics.revenueBreakdown(hostId, { months }),
    },

    list_bookings: {
        kind: 'read',
        description: 'Recent bookings, newest first. Use to answer questions about specific stays or to find a booking id.',
        parameters: {
            type: 'object',
            properties: {
                status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed'] },
                propertyId: { type: 'string', description: 'Property id from search_properties' },
            },
        },
        validate: (args) => ({
            status: optString(args?.status, 20),
            propertyId: optString(args?.propertyId, 40),
        }),
        execute: async (hostId, { status, propertyId }) => {
            const filter = { host: hostId }
            if (status) filter.bookingStatus = status
            if (propertyId) filter.property = propertyId
            const bookings = await bookingSchema.find(filter)
                .populate('property', 'title')
                .sort({ createdAt: -1 })
                .limit(LIST_LIMIT)
            return bookings.map((item) => ({
                id: String(item._id),
                property: item.property?.title,
                checkIn: item.checkInDate?.toISOString().slice(0, 10),
                checkOut: item.checkOutDate?.toISOString().slice(0, 10),
                nights: item.totalNights,
                rentalType: item.rentalType,
                total: item.totalAmount,
                bookingStatus: item.bookingStatus,
                paymentStatus: item.paymentStatus,
                couponCode: item.couponCode || null,
            }))
        },
    },

    list_coupons: {
        kind: 'read',
        description: 'Discount codes the caller owns, with how many times each has been used.',
        parameters: { type: 'object', properties: {} },
        validate: () => ({}),
        execute: async (hostId) => {
            const coupons = await couponSchema.find({ owner: hostId }).limit(LIST_LIMIT)
            return coupons.map((item) => ({
                id: String(item._id),
                code: item.code,
                discountType: item.discountType,
                value: item.value,
                maxDiscount: item.maxDiscount || null,
                usedCount: item.usedCount,
                maxUses: item.maxUses,
                isActive: item.isActive,
                validUntil: item.validUntil?.toISOString().slice(0, 10) || null,
            }))
        },
    },

    list_pricing_rules: {
        kind: 'read',
        description: 'Seasonal and weekday rate overrides on one listing.',
        parameters: {
            type: 'object',
            properties: { propertyId: { type: 'string', description: 'Property id from search_properties' } },
            required: ['propertyId'],
        },
        validate: (args) => ({ propertyId: reqString(args?.propertyId, 'propertyId', 40) }),
        execute: async (hostId, { propertyId }) => {
            await ownedProperty(hostId, propertyId)
            const rules = await pricingRuleSchema.find({ property: propertyId })
            return rules.map((item) => ({
                id: String(item._id),
                name: item.name,
                nightlyRate: item.nightlyRate,
                monthlyRate: item.monthlyRate,
                daysOfWeek: item.daysOfWeek,
                startDate: item.startDate?.toISOString().slice(0, 10) || null,
                endDate: item.endDate?.toISOString().slice(0, 10) || null,
                priority: item.priority,
                isActive: item.isActive,
            }))
        },
    },

    list_pending_work: {
        kind: 'read',
        description: 'Anything waiting on the host right now: unpaid bookings, applications awaiting a decision and leases awaiting signature.',
        parameters: { type: 'object', properties: {} },
        validate: () => ({}),
        execute: async (hostId) => {
            const now = new Date()
            const unpaid = await bookingSchema.find({ host: hostId, bookingStatus: 'pending', paymentStatus: 'pending', expiresAt: { $gt: now } })
                .populate('property', 'title').limit(LIST_LIMIT)
            const applications = await rentalApplicationSchema.find({ landlord: hostId, status: { $in: ['submitted', 'screening'] } })
                .populate('property', 'title').limit(LIST_LIMIT)
            const leases = await leaseSchema.find({ landlord: hostId, status: 'pending_signature' })
                .populate('property', 'title').limit(LIST_LIMIT)

            return {
                unpaidBookings: unpaid.map((item) => ({
                    id: String(item._id), property: item.property?.title, total: item.totalAmount,
                    expiresAt: item.expiresAt?.toISOString(),
                })),
                applicationsAwaitingDecision: applications.map((item) => ({
                    id: String(item._id), property: item.property?.title,
                    submittedAt: item.createdAt?.toISOString().slice(0, 10),
                })),
                leasesAwaitingSignature: leases.map((item) => ({
                    id: String(item._id), property: item.property?.title, monthlyRent: item.monthlyRent,
                })),
            }
        },
    },

    // ── Writes: proposed, confirmed, then executed ──────────────────────────
    create_coupon: {
        kind: 'write',
        description:
            'Propose a discount code. Use after find_empty_dates when a campaign would help fill a gap. A percentage code should usually carry maxDiscount so it cannot take an unbounded amount.',
        parameters: {
            type: 'object',
            properties: {
                code: { type: 'string', description: 'Short uppercase code, e.g. NOVFILL15' },
                description: { type: 'string' },
                discountType: { type: 'string', enum: ['percentage', 'fixed'] },
                value: { type: 'number', description: 'Percent when percentage, dollars when fixed' },
                maxDiscount: { type: 'number', description: 'Cap in dollars on a percentage discount' },
                minNights: { type: 'number' },
                validUntil: { type: 'string', description: 'YYYY-MM-DD' },
                maxUses: { type: 'number', description: '0 means unlimited' },
                propertyId: { type: 'string', description: 'Limit to one listing. Omit for all.' },
            },
            required: ['code', 'discountType', 'value'],
        },
        summary: (args) =>
            `Create coupon ${String(args.code).toUpperCase()} — ${args.discountType === 'percentage' ? `${args.value}% off` : `$${args.value} off`}`,
        validate: (args) => {
            const discountType = reqString(args?.discountType, 'discountType', 20)
            if (!['percentage', 'fixed'].includes(discountType)) throw badRequest('discountType must be percentage or fixed')
            const value = optNumber(args?.value, 'value')
            if (!value || value <= 0) throw badRequest('value must be above zero')
            if (discountType === 'percentage' && value > 100) throw badRequest('A percentage cannot exceed 100')
            return {
                code: reqString(args?.code, 'code', 40).toUpperCase(),
                description: optString(args?.description, 200),
                discountType,
                value,
                maxDiscount: optNumber(args?.maxDiscount, 'maxDiscount'),
                minNights: optNumber(args?.minNights, 'minNights') || 0,
                validUntil: optString(args?.validUntil, 40),
                maxUses: optNumber(args?.maxUses, 'maxUses') || 0,
                propertyId: optString(args?.propertyId, 40),
            }
        },
        execute: async (hostId, args) => {
            const exists = await couponSchema.findOne({ code: args.code })
            if (exists) throw badRequest(`${args.code} already exists`)
            if (args.propertyId) await ownedProperty(hostId, args.propertyId)

            const coupon = await couponSchema.create({
                code: args.code,
                description: args.description,
                discountType: args.discountType,
                value: args.value,
                maxDiscount: args.maxDiscount,
                minNights: args.minNights,
                validUntil: args.validUntil || undefined,
                maxUses: args.maxUses,
                owner: hostId,
                properties: args.propertyId ? [args.propertyId] : [],
            })
            return { id: String(coupon._id), code: coupon.code }
        },
    },

    set_pricing_rule: {
        kind: 'write',
        description:
            'Propose a rate override for a date range, a set of weekdays, or both. Higher priority wins when two rules cover the same night. daysOfWeek uses 0 for Sunday.',
        parameters: {
            type: 'object',
            properties: {
                propertyId: { type: 'string', description: 'Property id from search_properties' },
                name: { type: 'string', description: 'Short label, e.g. "New Year" or "Weekend"' },
                nightlyRate: { type: 'number' },
                monthlyRate: { type: 'number' },
                startDate: { type: 'string', description: 'YYYY-MM-DD' },
                endDate: { type: 'string', description: 'YYYY-MM-DD' },
                daysOfWeek: { type: 'array', items: { type: 'number' }, description: '0 Sunday to 6 Saturday' },
                priority: { type: 'number' },
            },
            required: ['propertyId', 'name'],
        },
        summary: (args) => `Pricing rule "${args.name}"${args.nightlyRate ? ` at $${args.nightlyRate}/night` : ''}`,
        validate: (args) => {
            const nightlyRate = optNumber(args?.nightlyRate, 'nightlyRate')
            const monthlyRate = optNumber(args?.monthlyRate, 'monthlyRate')
            if (!nightlyRate && !monthlyRate) throw badRequest('A nightly or monthly rate is required')
            const daysOfWeek = Array.isArray(args?.daysOfWeek) ? args.daysOfWeek.map(Number).filter((day) => day >= 0 && day <= 6) : []
            return {
                propertyId: reqString(args?.propertyId, 'propertyId', 40),
                name: reqString(args?.name, 'name', 80),
                nightlyRate, monthlyRate, daysOfWeek,
                startDate: optString(args?.startDate, 40),
                endDate: optString(args?.endDate, 40),
                priority: optNumber(args?.priority, 'priority') || 0,
            }
        },
        execute: async (hostId, args) => {
            await ownedProperty(hostId, args.propertyId)
            const rule = await pricingRuleSchema.create({
                property: args.propertyId,
                name: args.name,
                nightlyRate: args.nightlyRate,
                monthlyRate: args.monthlyRate,
                daysOfWeek: args.daysOfWeek,
                startDate: args.startDate || undefined,
                endDate: args.endDate || undefined,
                priority: args.priority,
            })
            return { id: String(rule._id), name: rule.name }
        },
    },

    update_property: {
        kind: 'write',
        description:
            'Propose a change to a listing: its rates, its status, or its cancellation policy. Ownership, ratings and reviews cannot be changed here.',
        parameters: {
            type: 'object',
            properties: {
                propertyId: { type: 'string', description: 'Property id from search_properties' },
                pricePerNight: { type: 'number' },
                monthlyRate: { type: 'number' },
                longTermRent: { type: 'number' },
                status: { type: 'string', enum: ['draft', 'published', 'unpublished'] },
                cancellationPolicy: { type: 'string', enum: ['flexible', 'moderate', 'strict', 'non_refundable'] },
            },
            required: ['propertyId'],
        },
        summary: (args) => {
            const bits = []
            if (args.pricePerNight) bits.push(`$${args.pricePerNight}/night`)
            if (args.monthlyRate) bits.push(`$${args.monthlyRate}/month`)
            if (args.longTermRent) bits.push(`$${args.longTermRent} rent`)
            if (args.status) bits.push(args.status)
            if (args.cancellationPolicy) bits.push(`${args.cancellationPolicy} policy`)
            return `Update listing — ${bits.join(', ') || 'no change'}`
        },
        validate: (args) => {
            const out = { propertyId: reqString(args?.propertyId, 'propertyId', 40) }
            for (const field of ['pricePerNight', 'monthlyRate', 'longTermRent']) {
                const value = optNumber(args?.[field], field)
                if (value !== undefined) {
                    if (value < 0) throw badRequest(`${field} cannot be negative`)
                    out[field] = value
                }
            }
            const status = optString(args?.status, 20)
            if (status) {
                if (!['draft', 'published', 'unpublished'].includes(status)) throw badRequest('Invalid status')
                out.status = status
            }
            const policy = optString(args?.cancellationPolicy, 20)
            if (policy) {
                if (!['flexible', 'moderate', 'strict', 'non_refundable'].includes(policy)) throw badRequest('Invalid cancellation policy')
                out.cancellationPolicy = policy
            }
            if (Object.keys(out).length === 1) throw badRequest('Nothing to change')
            return out
        },
        execute: async (hostId, args) => {
            const { propertyId, ...changes } = args
            await ownedProperty(hostId, propertyId)
            const property = await propertySchema.findByIdAndUpdate(propertyId, changes, { new: true, runValidators: true })
            return { id: String(property._id), title: property.title, ...changes }
        },
    },

    block_dates: {
        kind: 'write',
        description: 'Propose taking a date range off the market, for personal use or maintenance.',
        parameters: {
            type: 'object',
            properties: {
                propertyId: { type: 'string' },
                startDate: { type: 'string', description: 'YYYY-MM-DD' },
                endDate: { type: 'string', description: 'YYYY-MM-DD' },
                reason: { type: 'string', enum: ['personal', 'maintenance', 'other'] },
                note: { type: 'string' },
            },
            required: ['propertyId', 'startDate', 'endDate'],
        },
        summary: (args) => `Block ${args.startDate} to ${args.endDate}`,
        validate: (args) => {
            const startDate = reqDate(args?.startDate, 'startDate')
            const endDate = reqDate(args?.endDate, 'endDate')
            if (startDate >= endDate) throw badRequest('endDate must be after startDate')
            return {
                propertyId: reqString(args?.propertyId, 'propertyId', 40),
                startDate, endDate,
                reason: optString(args?.reason, 20) || 'personal',
                note: optString(args?.note, 200),
            }
        },
        execute: async (hostId, args) => {
            await ownedProperty(hostId, args.propertyId)
            const clash = await bookingSchema.findOne({
                property: args.propertyId,
                $or: [{ bookingStatus: 'confirmed' }, { bookingStatus: 'pending', expiresAt: { $gt: new Date() } }],
                checkInDate: { $lt: args.endDate },
                checkOutDate: { $gt: args.startDate },
            })
            if (clash) throw badRequest('There is already a booking in that range')

            const block = await availabilitySchema.create({
                property: args.propertyId,
                startDate: args.startDate,
                endDate: args.endDate,
                reason: args.reason,
                note: args.note,
            })
            return { id: String(block._id) }
        },
    },
}

const readTools = Object.entries(tools).filter(([, tool]) => tool.kind === 'read').map(([name]) => name)
const writeTools = Object.entries(tools).filter(([, tool]) => tool.kind === 'write').map(([name]) => name)

/** The schema list handed to the model. */
const toolSchemas = () =>
    Object.entries(tools).map(([name, tool]) => ({
        name,
        description: tool.description,
        parameters: tool.parameters,
    }))

module.exports = { tools, toolSchemas, readTools, writeTools, badRequest }
