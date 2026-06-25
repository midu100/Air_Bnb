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
      ],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('payment',paymentSchema)