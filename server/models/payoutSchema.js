const mongoose = require('mongoose')

// ====== Money leaving the platform toward a host
// Guest payments previously reached the platform Stripe account and stopped.
const payoutSchema = new mongoose.Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "booking",
    },

    lease: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "lease",
    },

    grossAmount: {
      type: Number,
      required: true,
    },

    platformFee: {
      type: Number,
      default: 0,
    },

    netAmount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "USD",
    },

    // Held until the release date, so a guest can raise an issue after check-in
    releaseDate: Date,

    transferId: String,

    status: {
      type: String,
      enum: ["scheduled", "released", "paid", "failed", "reversed"],
      default: "scheduled",
    },

    failureReason: String,
  },
  {
    timestamps: true,
  }
);

payoutSchema.index({ host: 1, status: 1, releaseDate: 1 });

module.exports = mongoose.model('payout', payoutSchema)
