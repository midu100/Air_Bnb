const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "booking",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    transactionId: {
      type: String,
      unique: true,
    },

    paymentMethod: {
      type: String,
      enum: [
        "stripe",
        "sslcommerz",
        "paypal",
        "Bkash",
        "Nagad"
      ],
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "USD",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "refunded",
        "partially_refunded",
      ],
      default: "pending",
    },

    // A cancellation policy often returns only part of what was taken
    refundedAmount: {
      type: Number,
      default: 0,
    },

    refundedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('payment',paymentSchema)