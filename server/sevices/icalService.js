const availabilitySchema = require("../models/availabilitySchema")
const bookingSchema = require("../models/bookingSchema")

// ====== iCal export
// A host listing here and on another channel will be double booked without this.

const pad = (value) => String(value).padStart(2, '0')

// iCal wants YYYYMMDD for all-day events
const toICalDate = (date) => {
    const d = new Date(date)
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`
}

const toICalStamp = (date) => {
    const d = new Date(date)
    return `${toICalDate(d)}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
}

// Long lines must be folded at 75 octets or strict parsers reject the feed
const foldLine = (line) => {
    if (line.length <= 74) return line
    const chunks = [line.slice(0, 74)]
    let rest = line.slice(74)
    while (rest.length > 73) {
        chunks.push(' ' + rest.slice(0, 73))
        rest = rest.slice(73)
    }
    if (rest.length) chunks.push(' ' + rest)
    return chunks.join('\r\n')
}

const escapeText = (text) => String(text || '').replace(/[\;,]/g, (m) => '\\' + m).replace(/\n/g, '\\n')

const buildCalendar = async (property) => {
    const now = new Date()

    const bookings = await bookingSchema.find({
        property: property._id,
        checkOutDate: { $gte: now },
        $or: [
            { bookingStatus: 'confirmed' },
            { bookingStatus: 'pending', expiresAt: { $gt: now } }
        ]
    }).select('checkInDate checkOutDate rentalType createdAt')

    const blocks = await availabilitySchema.find({
        property: property._id,
        endDate: { $gte: now }
    }).select('startDate endDate reason note createdAt')

    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Air-bnb//Property Calendar//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        foldLine(`X-WR-CALNAME:${escapeText(property.title)}`),
    ]

    for (const booking of bookings) {
        lines.push(
            'BEGIN:VEVENT',
            `UID:booking-${booking._id}@airbnb`,
            `DTSTAMP:${toICalStamp(booking.createdAt || now)}`,
            `DTSTART;VALUE=DATE:${toICalDate(booking.checkInDate)}`,
            `DTEND;VALUE=DATE:${toICalDate(booking.checkOutDate)}`,
            foldLine(`SUMMARY:Booked (${booking.rentalType === 'mid' ? 'monthly' : 'nightly'})`),
            'TRANSP:OPAQUE',
            'END:VEVENT'
        )
    }

    for (const block of blocks) {
        lines.push(
            'BEGIN:VEVENT',
            `UID:block-${block._id}@airbnb`,
            `DTSTAMP:${toICalStamp(block.createdAt || now)}`,
            `DTSTART;VALUE=DATE:${toICalDate(block.startDate)}`,
            `DTEND;VALUE=DATE:${toICalDate(block.endDate)}`,
            foldLine(`SUMMARY:Unavailable${block.note ? ' - ' + escapeText(block.note) : ''}`),
            'TRANSP:OPAQUE',
            'END:VEVENT'
        )
    }

    lines.push('END:VCALENDAR')
    return lines.join('\r\n')
}

// ====== iCal import
// Minimal VEVENT reader - enough for the DTSTART/DTEND/UID that channels publish.
const parseCalendar = (text) => {
    // Unfold first, a folded line continues with a space
    const unfolded = String(text).replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '')
    const events = []
    let current = null

    for (const rawLine of unfolded.split(/\r\n|\n/)) {
        const line = rawLine.trim()
        if (line === 'BEGIN:VEVENT') { current = {}; continue }
        if (line === 'END:VEVENT') {
            if (current?.start && current?.end) events.push(current)
            current = null
            continue
        }
        if (!current) continue

        const separator = line.indexOf(':')
        if (separator === -1) continue
        const key = line.slice(0, separator)
        const value = line.slice(separator + 1)

        if (key.startsWith('DTSTART')) current.start = parseICalDate(value)
        else if (key.startsWith('DTEND')) current.end = parseICalDate(value)
        else if (key === 'UID') current.uid = value
        else if (key === 'SUMMARY') current.summary = value
    }

    return events
}

const parseICalDate = (value) => {
    const clean = value.trim()
    const match = clean.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})Z?)?$/)
    if (!match) return null
    const [, year, month, day, hour = '00', minute = '00', second = '00'] = match
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)))
}

// ====== Pull one feed in and mirror it as blocked dates
const importCalendar = async (property, feed) => {
    const response = await fetch(feed.url)
    if (!response.ok) throw new Error(`Feed responded ${response.status}`)

    const events = parseCalendar(await response.text())
    let imported = 0

    for (const event of events) {
        if (!event.start || !event.end || event.end <= event.start) continue

        const externalUid = event.uid || `${feed.url}-${event.start.toISOString()}`

        // Upsert so re-syncing the same feed does not pile up duplicates
        const result = await availabilitySchema.updateOne(
            { property: property._id, externalSource: feed.url, externalUid },
            {
                $set: {
                    property: property._id,
                    startDate: event.start,
                    endDate: event.end,
                    reason: 'external_booking',
                    note: event.summary || feed.label || 'Imported',
                    externalSource: feed.url,
                    externalUid,
                }
            },
            { upsert: true }
        )
        if (result.upsertedCount || result.modifiedCount) imported++
    }

    return { total: events.length, imported }
}

module.exports = { buildCalendar, parseCalendar, importCalendar }
