const Stripe = require("stripe");

// Lazily created so the server still boots when Stripe keys are not configured yet
let stripeClient = null

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) return null
  if (!stripeClient) stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY)
  return stripeClient
}

module.exports = getStripe
