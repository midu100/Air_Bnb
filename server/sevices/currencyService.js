// ====== Multi-currency display
// Listings are priced and settled in the host's currency. A guest may view
// another. Rates are cached so a page render never blocks on a network call.

const SUPPORTED = ['USD', 'EUR', 'GBP', 'BDT', 'AED', 'INR', 'CAD', 'AUD', 'SGD', 'JPY']

const SYMBOLS = {
    USD: '$', EUR: '€', GBP: '£', BDT: '৳', AED: 'AED',
    INR: '₹', CAD: 'CA$', AUD: 'A$', SGD: 'S$', JPY: '¥',
}

// Fallback table, used until a live fetch succeeds and whenever one fails
const FALLBACK_RATES = {
    USD: 1, EUR: 0.92, GBP: 0.79, BDT: 119.5, AED: 3.67,
    INR: 83.4, CAD: 1.36, AUD: 1.52, SGD: 1.34, JPY: 152.3,
}

const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6 hours

let cache = { rates: { ...FALLBACK_RATES }, fetchedAt: 0, live: false }

const getRates = async () => {
    const isFresh = Date.now() - cache.fetchedAt < CACHE_TTL_MS
    if (isFresh && cache.live) return cache

    try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD')
        if (response.ok) {
            const data = await response.json()
            if (data?.rates) {
                const rates = { USD: 1 }
                for (const code of SUPPORTED) {
                    if (data.rates[code]) rates[code] = data.rates[code]
                }
                cache = { rates, fetchedAt: Date.now(), live: true }
                return cache
            }
        }
    } catch (error) {
        console.log(error)
    }

    // Keep serving the last good table rather than failing the request
    cache.fetchedAt = Date.now()
    return cache
}

const convert = (amount, from, to, rates) => {
    const fromRate = rates[from] || 1
    const toRate = rates[to] || 1
    const usd = amount / fromRate
    return Math.round(usd * toRate * 100) / 100
}

const format = (amount, currency) => {
    const symbol = SYMBOLS[currency] || currency + ' '
    const rounded = ['BDT', 'JPY', 'INR'].includes(currency) ? Math.round(amount) : amount
    return `${symbol}${rounded.toLocaleString()}`
}

module.exports = { SUPPORTED, SYMBOLS, getRates, convert, format }
