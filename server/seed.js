require('dotenv').config()
const mongoose = require('mongoose')
const dbConfig = require('./dbConfig')
const userSchema = require('./models/authSchema')
const categorySchema = require('./models/categorySchema')
const amenitySchema = require('./models/amenitySchema')
const propertySchema = require('./models/propertySchema')
const bookingSchema = require('./models/bookingSchema')
const paymentSchema = require('./models/paymentSchema')
const payoutSchema = require('./models/payoutSchema')

// ====== Known admin, so the panel is always reachable in a fresh environment
const ADMIN = {
    fullName: 'Platform Admin',
    email: 'admin@airbnb.test',
    password: 'Admin1234',
    phone: '+8801700000001',
    role: 'admin',
    isVerified: true,
}

// ====== Demo host that owns every seeded listing
const HOST = {
    fullName: 'Kazi Mridul',
    email: 'host@airbnb.test',
    password: 'Host1234',
    phone: '+8801700000000',
    role: 'host',
    isVerified: true,
}

const CATEGORIES = [
    { name: 'Hotels', slug: 'hotels', description: 'Premium hotel stays', thumbnail: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=450&fit=crop&q=80' },
    { name: 'Apartments', slug: 'apartments', description: 'Modern city apartments', thumbnail: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=450&fit=crop&q=80' },
    { name: 'Resorts', slug: 'resorts', description: 'Luxury beachfront resorts', thumbnail: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&h=450&fit=crop&q=80' },
    { name: 'Villas', slug: 'villas', description: 'Private villas with pools', thumbnail: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=450&fit=crop&q=80' },
    { name: 'Cabins', slug: 'cabins', description: 'Cozy forest cabins', thumbnail: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=600&h=450&fit=crop&q=80' },
]

const AMENITIES = [
    { name: 'wifi', icon: 'FaWifi' },
    { name: 'Air conditioning', icon: 'FaSnowflake' },
    { name: 'Kitchen', icon: 'FaUtensils' },
    { name: 'Free parking', icon: 'FaCar' },
    { name: 'Swimming pool', icon: 'FaSwimmingPool' },
    { name: 'Washer', icon: 'FaTshirt' },
    { name: 'TV', icon: 'FaTv' },
    { name: 'Gym', icon: 'FaDumbbell' },
]

const img = (id) => `https://images.unsplash.com/photo-${id}?w=1200&h=800&fit=crop&q=80`

const PROPERTIES = [
    {
        title: 'Beachfront Villa with Infinity Pool',
        rentalTypes: ['short','mid'],
        monthlyRate: 8200,
        utilitiesIncluded: true,
        discounts: { weekly: 10, monthly: 28 },
        furnished: 'furnished',
        description: 'Wake up to the sound of waves in this airy villa perched right on the sand. Floor to ceiling glass opens onto a private infinity pool that seems to spill into the ocean. The open plan living area seats eight comfortably, and the chef kitchen is stocked for long slow breakfasts.',
        propertyType: 'Villa', category: 'villas',
        thumbnail: img('1613490493576-7fde63acd811'),
        images: [img('1613490493576-7fde63acd811'), img('1499793983690-e29da59ef1c2'), img('1600596542815-ffad4c1539a9')],
        pricePerNight: 420, cleaningFee: 60, serviceFee: 45,
        maxGuests: 8, bedrooms: 4, beds: 5, bathrooms: 3,
        address: '12 Ocean Drive', city: 'Cox\'s Bazar', state: 'Chittagong', country: 'Bangladesh', zipCode: '4700',
        coordinates: { latitude: 21.4272, longitude: 91.9700 },
        houseRules: ['No smoking', 'No parties or events', 'Check-in after 2:00 PM'],
        isFeatured: true,
    },
    {
        title: 'Minimalist Loft in the City Centre',
        rentalTypes: ['short','mid','long'],
        monthlyRate: 3200,
        longTermRent: 2400,
        securityDeposit: 3200,
        utilitiesIncluded: true,
        discounts: { weekly: 10, monthly: 28 },
        furnished: 'furnished',
        description: 'A quiet loft on the top floor of a converted warehouse, five minutes from the metro. Concrete, oak and a lot of daylight. Perfect for a solo traveller or a couple who want to walk everywhere and come home to somewhere calm.',
        propertyType: 'Apartment', category: 'apartments',
        thumbnail: img('1502672260266-1c1ef2d93688'),
        images: [img('1502672260266-1c1ef2d93688'), img('1493809842364-78817add7ffb'), img('1522708323590-d24dbb6b0267')],
        pricePerNight: 145, cleaningFee: 25, serviceFee: 18,
        maxGuests: 2, bedrooms: 1, beds: 1, bathrooms: 1,
        address: '88 Gulshan Avenue', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', zipCode: '1212',
        coordinates: { latitude: 23.7925, longitude: 90.4078 },
        houseRules: ['No smoking', 'Quiet hours after 10:00 PM'],
        isFeatured: true,
    },
    {
        title: 'Pine Forest Cabin with Wood Stove',
        rentalTypes: ['short'],
        utilitiesIncluded: false,
        discounts: { weekly: 10, monthly: 28 },
        furnished: 'furnished',
        description: 'An off grid cabin ringed by pines, with a cast iron wood stove and a deep porch made for reading. There is no television here on purpose. Trails start at the front door and the nearest village is a fifteen minute drive.',
        propertyType: 'Cabin', category: 'cabins',
        thumbnail: img('1449158743715-0a90ebb6d2d8'),
        images: [img('1449158743715-0a90ebb6d2d8'), img('1518780664697-55e3ad937233'), img('1470770841072-f978cf4d019e')],
        pricePerNight: 190, cleaningFee: 35, serviceFee: 22,
        maxGuests: 4, bedrooms: 2, beds: 3, bathrooms: 1,
        address: 'Hill Track Road 9', city: 'Bandarban', state: 'Chittagong', country: 'Bangladesh', zipCode: '4600',
        coordinates: { latitude: 22.1953, longitude: 92.2184 },
        houseRules: ['No smoking indoors', 'Pets allowed', 'Carry out what you carry in'],
    },
    {
        title: 'Grand Harbour Hotel Suite',
        rentalTypes: ['short'],
        utilitiesIncluded: false,
        discounts: { weekly: 10, monthly: 28 },
        furnished: 'furnished',
        description: 'A corner suite on the eighteenth floor with a wraparound view of the harbour. Comes with lounge access, a marble bathroom with a soaking tub, and a desk wide enough to actually work at. Breakfast is included for two.',
        propertyType: 'Hotel', category: 'hotels',
        thumbnail: img('1618773928121-c32242e63f39'),
        images: [img('1618773928121-c32242e63f39'), img('1611892440504-42a792e24d32'), img('1582719478250-c89cae4dc85b')],
        pricePerNight: 310, cleaningFee: 0, serviceFee: 40,
        maxGuests: 3, bedrooms: 1, beds: 2, bathrooms: 1,
        address: '1 Marine Parade', city: 'Chattogram', state: 'Chittagong', country: 'Bangladesh', zipCode: '4000',
        coordinates: { latitude: 22.3569, longitude: 91.7832 },
        houseRules: ['No smoking', 'Valid ID required at check-in'],
    },
    {
        title: 'Palm Grove Resort Bungalow',
        rentalTypes: ['short','mid'],
        monthlyRate: 5400,
        utilitiesIncluded: true,
        discounts: { weekly: 10, monthly: 28 },
        furnished: 'furnished',
        description: 'A standalone bungalow inside a quiet resort, with an outdoor shower and a hammock strung between two palms. Shared access to three pools and a spa. Staff will happily arrange boat trips and dinner on the beach.',
        propertyType: 'House', category: 'resorts',
        thumbnail: img('1582719508461-905c673771fd'),
        images: [img('1582719508461-905c673771fd'), img('1571003123894-1f0594d2b5d9'), img('1520250497591-112f2f40a3f4')],
        pricePerNight: 265, cleaningFee: 40, serviceFee: 30,
        maxGuests: 5, bedrooms: 2, beds: 3, bathrooms: 2,
        address: 'Inani Beach Road', city: 'Cox\'s Bazar', state: 'Chittagong', country: 'Bangladesh', zipCode: '4701',
        coordinates: { latitude: 21.2333, longitude: 92.0500 },
        houseRules: ['No smoking', 'No pets', 'Respect quiet hours'],
        isFeatured: true,
    },
    {
        title: 'Tea Estate Colonial House',
        rentalTypes: ['mid','long'],
        monthlyRate: 4600,
        longTermRent: 3400,
        securityDeposit: 4600,
        utilitiesIncluded: true,
        discounts: { weekly: 10, monthly: 28 },
        furnished: 'furnished',
        description: 'A restored planter\'s bungalow on a working tea estate, with wide verandas, teak floors and mist that rolls in every morning. Six of you can spread out easily. The caretaker brings fresh bread and eggs each day.',
        propertyType: 'House', category: 'villas',
        thumbnail: img('1568605114967-8130f3a36994'),
        images: [img('1568605114967-8130f3a36994'), img('1600607687939-ce8a6c25118c'), img('1600566753086-00f18fb6b3ea')],
        pricePerNight: 230, cleaningFee: 45, serviceFee: 25,
        maxGuests: 6, bedrooms: 3, beds: 4, bathrooms: 2,
        address: 'Malnicherra Estate', city: 'Sylhet', state: 'Sylhet', country: 'Bangladesh', zipCode: '3100',
        coordinates: { latitude: 24.9045, longitude: 91.8611 },
        houseRules: ['No smoking indoors', 'Children welcome'],
    },
    {
        title: 'Riverside Studio with Balcony',
        rentalTypes: ['short','mid','long'],
        monthlyRate: 1900,
        longTermRent: 1450,
        securityDeposit: 1900,
        utilitiesIncluded: true,
        discounts: { weekly: 10, monthly: 28 },
        furnished: 'furnished',
        description: 'A compact, well lit studio looking straight down the river. Everything you need and nothing you do not. The balcony holds two chairs and a small table, which is where you will spend most evenings.',
        propertyType: 'Room', category: 'apartments',
        thumbnail: img('1493809842364-78817add7ffb'),
        images: [img('1493809842364-78817add7ffb'), img('1560448204-e02f11c3d0e2'), img('1484154218962-a197022b5858')],
        pricePerNight: 95, cleaningFee: 18, serviceFee: 12,
        maxGuests: 2, bedrooms: 1, beds: 1, bathrooms: 1,
        address: 'Padma Riverfront 4', city: 'Rajshahi', state: 'Rajshahi', country: 'Bangladesh', zipCode: '6000',
        coordinates: { latitude: 24.3745, longitude: 88.6042 },
        houseRules: ['No smoking', 'No parties'],
    },
    {
        title: 'Skyline Penthouse with Rooftop Terrace',
        rentalTypes: ['long','mid'],
        monthlyRate: 7600,
        longTermRent: 5800,
        securityDeposit: 7600,
        utilitiesIncluded: true,
        discounts: { weekly: 10, monthly: 28 },
        furnished: 'furnished',
        description: 'The whole top floor, plus a private rooftop terrace with an outdoor kitchen and city lights in every direction. Three bedrooms all have their own bathroom, so it works well for two families travelling together.',
        propertyType: 'Apartment', category: 'apartments',
        thumbnail: img('1512918728675-ed5a9ecdebfd'),
        images: [img('1512918728675-ed5a9ecdebfd'), img('1522708323590-d24dbb6b0267'), img('1502005229762-cf1b2da7c5d6')],
        pricePerNight: 380, cleaningFee: 55, serviceFee: 38,
        maxGuests: 6, bedrooms: 3, beds: 4, bathrooms: 3,
        address: '21 Banani Road 11', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', zipCode: '1213',
        coordinates: { latitude: 23.7940, longitude: 90.4043 },
        houseRules: ['No smoking', 'No events without approval', 'Check-out before 11:00 AM'],
        isFeatured: true,
    },
    {
        title: 'Canal House with Private Dock',
        description: 'A tall, narrow seventeenth century house on a quiet canal, restored with underfloor heating and a kitchen that works. The top floor study looks out over the water. Bicycles are included, and the dock takes a small boat.',
        propertyType: 'House', category: 'villas',
        rentalTypes: ['short','mid','long'],
        monthlyRate: 5200, longTermRent: 3900, securityDeposit: 5200,
        utilitiesIncluded: true, discounts: { weekly: 12, monthly: 30 }, furnished: 'furnished',
        cancellationPolicy: 'strict', taxRatePercent: 7, currency: 'EUR',
        workspace: { dedicatedDesk: true, monitor: true, internetSpeedMbps: 500, laundryInUnit: true, separateWorkRoom: true },
        thumbnail: img('1600585154340-be6161a56a0c'),
        images: [img('1600585154340-be6161a56a0c'), img('1600607687939-ce8a6c25118c')],
        pricePerNight: 285, cleaningFee: 55, serviceFee: 30,
        maxGuests: 6, bedrooms: 3, beds: 4, bathrooms: 2,
        address: 'Prinsengracht 402', city: 'Amsterdam', state: 'North Holland', country: 'Netherlands', zipCode: '1016',
        coordinates: { latitude: 52.3676, longitude: 4.8852 },
        houseRules: ['No smoking', 'No parties', 'Shoes off indoors'],
        isFeatured: true,
    },
    {
        title: 'Shibuya Micro-Apartment',
        description: 'Small, precise and five minutes from the station. Everything folds, slides or stacks. The window seat is the best place in the flat and the neighbourhood never really sleeps.',
        propertyType: 'Apartment', category: 'apartments',
        rentalTypes: ['short','mid'],
        monthlyRate: 2600, securityDeposit: 2600,
        utilitiesIncluded: true, discounts: { weekly: 8, monthly: 22 }, furnished: 'furnished',
        cancellationPolicy: 'moderate', taxRatePercent: 10, currency: 'JPY',
        workspace: { dedicatedDesk: true, monitor: false, internetSpeedMbps: 900, laundryInUnit: true },
        thumbnail: img('1493809842364-78817add7ffb'),
        images: [img('1493809842364-78817add7ffb'), img('1522708323590-d24dbb6b0267')],
        pricePerNight: 128, cleaningFee: 30, serviceFee: 15,
        maxGuests: 2, bedrooms: 1, beds: 1, bathrooms: 1,
        address: '2-11 Dogenzaka', city: 'Tokyo', state: 'Tokyo', country: 'Japan', zipCode: '150-0043',
        coordinates: { latitude: 35.6595, longitude: 139.7005 },
        houseRules: ['No smoking', 'Quiet after 10:00 PM'],
    },
    {
        title: 'Marina Tower Two-Bedroom',
        description: 'High floor, floor to ceiling glass, and a balcony that catches the evening breeze off the water. Building has a gym, a pool on the ninth floor and covered parking. Walkable to the tram.',
        propertyType: 'Apartment', category: 'apartments',
        rentalTypes: ['mid','long'],
        monthlyRate: 4100, longTermRent: 3200, securityDeposit: 4100,
        utilitiesIncluded: false, utilityCap: 200, discounts: { weekly: 0, monthly: 25 }, furnished: 'furnished',
        cancellationPolicy: 'moderate', taxRatePercent: 5, currency: 'AED',
        workspace: { dedicatedDesk: true, monitor: true, internetSpeedMbps: 300, laundryInUnit: true },
        thumbnail: img('1512918728675-ed5a9ecdebfd'),
        images: [img('1512918728675-ed5a9ecdebfd'), img('1502005229762-cf1b2da7c5d6')],
        pricePerNight: 210, cleaningFee: 45, serviceFee: 25,
        maxGuests: 4, bedrooms: 2, beds: 3, bathrooms: 2,
        address: 'Marina Promenade 8', city: 'Dubai', state: 'Dubai', country: 'United Arab Emirates', zipCode: '00000',
        coordinates: { latitude: 25.0805, longitude: 55.1403 },
        houseRules: ['No smoking', 'No pets', 'Building rules apply'],
        isFeatured: true,
    },
    {
        title: 'Notting Hill Garden Flat',
        description: 'The lower two floors of a stucco terrace, opening onto a shared garden square residents have keys to. Original fireplaces, a proper pantry, and the market two streets away on Saturdays.',
        propertyType: 'Apartment', category: 'apartments',
        rentalTypes: ['mid','long'],
        monthlyRate: 4800, longTermRent: 3700, securityDeposit: 5550,
        utilitiesIncluded: false, discounts: { weekly: 0, monthly: 20 }, furnished: 'semi',
        cancellationPolicy: 'strict', taxRatePercent: 0, currency: 'GBP',
        workspace: { dedicatedDesk: true, monitor: false, internetSpeedMbps: 350, laundryInUnit: true },
        thumbnail: img('1600607687939-ce8a6c25118c'),
        images: [img('1600607687939-ce8a6c25118c'), img('1600566753086-00f18fb6b3ea')],
        pricePerNight: 240, cleaningFee: 60, serviceFee: 28,
        maxGuests: 4, bedrooms: 2, beds: 2, bathrooms: 2,
        address: '14 Colville Terrace', city: 'London', state: 'England', country: 'United Kingdom', zipCode: 'W11',
        coordinates: { latitude: 51.5155, longitude: -0.2010 },
        houseRules: ['No smoking', 'No parties', 'Garden square rules apply'],
    },
    {
        title: 'Brooklyn Loft with Freight Elevator',
        description: 'A converted printworks with fifteen foot ceilings and windows on three sides. Sleeps six across two mezzanines. The freight elevator opens straight into the apartment, which never stops being fun.',
        propertyType: 'Apartment', category: 'apartments',
        rentalTypes: ['short','mid','long'],
        monthlyRate: 6200, longTermRent: 4900, securityDeposit: 6200,
        utilitiesIncluded: false, discounts: { weekly: 10, monthly: 27 }, furnished: 'furnished',
        cancellationPolicy: 'flexible', taxRatePercent: 14.75, currency: 'USD',
        workspace: { dedicatedDesk: true, monitor: true, internetSpeedMbps: 1000, laundryInUnit: true, separateWorkRoom: true },
        thumbnail: img('1522708323590-d24dbb6b0267'),
        images: [img('1522708323590-d24dbb6b0267'), img('1502672260266-1c1ef2d93688')],
        pricePerNight: 340, cleaningFee: 75, serviceFee: 40,
        maxGuests: 6, bedrooms: 2, beds: 4, bathrooms: 2,
        address: '55 Washington Street', city: 'New York', state: 'New York', country: 'United States', zipCode: '11201',
        coordinates: { latitude: 40.7033, longitude: -73.9881 },
        houseRules: ['No smoking', 'No events', 'Freight elevator hours 7am-10pm'],
        isFeatured: true,
    },
    {
        title: 'Barcelona Rooftop with Terrace',
        description: 'Top floor of a modernista block in Gracia, with a private terrace bigger than the living room. Shaded in the afternoon, and the right place to eat dinner from May to October.',
        propertyType: 'Apartment', category: 'apartments',
        rentalTypes: ['short','mid'],
        monthlyRate: 3400, securityDeposit: 3400,
        utilitiesIncluded: true, discounts: { weekly: 12, monthly: 26 }, furnished: 'furnished',
        cancellationPolicy: 'moderate', taxRatePercent: 9, currency: 'EUR',
        workspace: { dedicatedDesk: true, monitor: false, internetSpeedMbps: 600, laundryInUnit: true },
        thumbnail: img('1560448204-e02f11c3d0e2'),
        images: [img('1560448204-e02f11c3d0e2'), img('1484154218962-a197022b5858')],
        pricePerNight: 165, cleaningFee: 40, serviceFee: 20,
        maxGuests: 4, bedrooms: 2, beds: 2, bathrooms: 1,
        address: 'Carrer de Verdi 88', city: 'Barcelona', state: 'Catalonia', country: 'Spain', zipCode: '08012',
        coordinates: { latitude: 41.4036, longitude: 2.1561 },
        houseRules: ['No smoking', 'Quiet on the terrace after 11:00 PM'],
    },
]


// ====== Booking history
// Without past stays the dashboard and the assistant have nothing to reason about,
// so seed a spread that makes the performance gap between properties visible:
// a few strong performers, a few quiet ones, some refunds and a cancellation.
const DAY = 24 * 60 * 60 * 1000

// Occupancy weight per listing title fragment - higher means more past stays
const DEMAND = {
    'Brooklyn': 0.9,
    'Skyline': 0.8,
    'Canal House': 0.75,
    'Notting Hill': 0.7,
    'Marina Tower': 0.6,
    'Barcelona': 0.55,
    'Minimalist Loft': 0.5,
    'Shibuya': 0.45,
    'Beachfront Villa': 0.4,
    'Palm Grove': 0.35,
    'Riverside': 0.3,
    'Tea Estate': 0.25,
    'Grand Harbour': 0.2,
    'Pine Forest': 0.12,
}

const demandFor = (title) => {
    const key = Object.keys(DEMAND).find((fragment) => title.includes(fragment))
    return key ? DEMAND[key] : 0.3
}

const seedBookings = async (host, guest) => {
    // A handful of bookings may exist from manual testing - that is not history.
    // Only skip once there is a real spread to reason about.
    const existing = await bookingSchema.countDocuments({ host: host._id })
    if (existing >= 40) return { created: 0, skipped: existing }

    const properties = await propertySchema.find({ host: host._id, status: 'published' })
    const now = Date.now()
    let created = 0

    for (const property of properties) {
        const demand = demandFor(property.title)
        // Roughly one stay per fortnight at full demand, over the last six months
        const stays = Math.round(12 * demand)

        for (let index = 0; index < stays; index++) {
            const nights = 2 + ((index * 3) % 6)
            // Spread backwards from today, leaving the near future open for campaigns
            const startOffset = 175 - Math.round((index / Math.max(1, stays)) * 170)
            const checkIn = new Date(now - startOffset * DAY)
            const checkOut = new Date(checkIn.getTime() + nights * DAY)

            const overlap = await bookingSchema.findOne({
                property: property._id,
                checkInDate: { $lt: checkOut },
                checkOutDate: { $gt: checkIn },
            })
            if (overlap) continue

            const gross = property.pricePerNight * nights
            const taxAmount = Math.round(gross * ((property.taxRatePercent || 0) / 100) * 100) / 100
            const totalAmount = Math.round((gross + (property.cleaningFee || 0) + (property.serviceFee || 0) + taxAmount) * 100) / 100

            // One stay in eight is cancelled, one in ten is partly refunded
            const isCancelled = index % 8 === 7
            const refundAmount = !isCancelled && index % 10 === 9 ? Math.round(totalAmount * 0.5 * 100) / 100 : 0

            const booking = await bookingSchema.create({
                guest: guest._id,
                host: host._id,
                property: property._id,
                rentalType: 'short',
                checkInDate: checkIn,
                checkOutDate: checkOut,
                totalNights: nights,
                guestsCount: 1 + (index % 3),
                pricePerNight: property.pricePerNight,
                cleaningFee: property.cleaningFee,
                serviceFee: property.serviceFee,
                taxAmount,
                totalAmount,
                refundAmount,
                cancellationPolicy: property.cancellationPolicy || 'moderate',
                bookingStatus: isCancelled ? 'cancelled' : 'completed',
                paymentStatus: isCancelled ? 'refunded' : 'paid',
                createdAt: new Date(checkIn.getTime() - (10 + (index % 25)) * DAY),
            })

            if (!isCancelled) {
                await paymentSchema.create({
                    booking: booking._id,
                    user: guest._id,
                    transactionId: `pi_seed_${booking._id}`,
                    paymentMethod: 'stripe',
                    amount: totalAmount,
                    currency: property.currency || 'USD',
                    status: refundAmount > 0 ? 'partially_refunded' : 'paid',
                    refundedAmount: refundAmount,
                })

                const payable = Math.max(0, totalAmount - taxAmount)
                const platformFee = Math.round(payable * 0.12 * 100) / 100
                await payoutSchema.create({
                    host: host._id,
                    booking: booking._id,
                    grossAmount: Math.round(payable * 100) / 100,
                    platformFee,
                    netAmount: Math.round((payable - platformFee) * 100) / 100,
                    releaseDate: new Date(checkIn.getTime() + DAY),
                    status: 'paid',
                    createdAt: booking.createdAt,
                })
            }

            created++
        }
    }

    return { created, skipped: 0 }
}

const seed = async () => {
    try {
        await dbConfig()

        // ====== Admin
        let admin = await userSchema.findOne({ email: ADMIN.email })
        if (!admin) {
            admin = await userSchema.create(ADMIN)
            console.log(`created admin ${ADMIN.email} / ${ADMIN.password}`)
        } else {
            console.log(`admin ${ADMIN.email} already exists`)
        }

        // ====== Host
        let host = await userSchema.findOne({ email: HOST.email })
        if (!host) {
            host = await userSchema.create(HOST)
            console.log(`created host ${HOST.email} / ${HOST.password}`)
        } else {
            console.log(`host ${HOST.email} already exists`)
        }

        // ====== Categories
        const categoryMap = {}
        for (const item of CATEGORIES) {
            let category = await categorySchema.findOne({ slug: item.slug })
            if (!category) category = await categorySchema.create(item)
            categoryMap[item.slug] = category._id
        }
        console.log(`categories ready: ${Object.keys(categoryMap).length}`)

        // ====== Amenities
        const amenityIds = []
        for (const item of AMENITIES) {
            let amenity = await amenitySchema.findOne({ name: item.name })
            if (!amenity) amenity = await amenitySchema.create(item)
            amenityIds.push(amenity._id)
        }
        console.log(`amenities ready: ${amenityIds.length}`)

        // ====== Properties
        let created = 0
        let updated = 0
        for (const item of PROPERTIES) {
            const { category, ...rest } = item

            // ====== Already seeded? Refresh only the horizon configuration.
            const exist = await propertySchema.findOne({ title: item.title })
            if (exist) {
                await propertySchema.findByIdAndUpdate(exist._id, {
                    rentalTypes: rest.rentalTypes,
                    monthlyRate: rest.monthlyRate,
                    longTermRent: rest.longTermRent,
                    securityDeposit: rest.securityDeposit,
                    utilitiesIncluded: rest.utilitiesIncluded,
                    discounts: rest.discounts,
                    furnished: rest.furnished,
                    cancellationPolicy: rest.cancellationPolicy,
                    taxRatePercent: rest.taxRatePercent,
                    currency: rest.currency,
                    workspace: rest.workspace,
                    coordinates: rest.coordinates,
                    isFeatured: rest.isFeatured,
                    status: 'published',
                })
                updated++
                continue
            }

            await propertySchema.create({
                ...rest,
                host: host._id,
                category: categoryMap[category],
                // Pick a rotating slice of amenities so listings differ from each other
                amenities: amenityIds.slice(0, 4 + (created % 4)),
                status: 'published',
            })
            created++
        }
        console.log(`properties created: ${created}, horizon config updated: ${updated}`)

        // ====== Booking history
        const history = await seedBookings(host, admin)
        console.log(`bookings seeded: ${history.created}${history.skipped ? ` (skipped, ${history.skipped} already present)` : ''}`)

        const total = await propertySchema.countDocuments({ status: 'published' })
        console.log(`published properties in DB: ${total}`)

        // ====== Horizon coverage
        for (const type of ['short', 'mid', 'long']) {
            const count = await propertySchema.countDocuments({ status: 'published', rentalTypes: type })
            console.log(`  ${type.padEnd(6)} : ${count} listing(s)`)
        }

        await mongoose.connection.close()
        process.exit(0)
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

seed()
