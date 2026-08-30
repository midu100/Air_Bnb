const mongoose = require('mongoose')

// ====== One scheduled charge on a mid-term stay
// A mid-term guest pays the first month up front and the rest month by month,
// so each future month needs its own record to charge, retry and audit.
const installmentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "booking",
      required: true,
    },

    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    sequence: {
      type: Number,
      required: true,
    },

    periodStart: Date,
    periodEnd: Date,

    dueDate: {
      type: Date,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    // A part month at the end of a stay is charged pro rata
    isProrated: {
      type: Boolean,
      default: false,
    },

    proratedDays: Number,

    transactionId: String,

    attempts: {
      type: Number,
      default: 0,
    },

    lastAttemptAt: Date,
    failureReason: String,
    paidAt: Date,

    status: {
      type: String,
      enum: ["upcoming", "due", "paid", "failed", "cancelled"],
      default: "upcoming",
    },
  },
  {
    timestamps: true,
  }
);

installmentSchema.index({ booking: 1, sequence: 1 }, { unique: true });
installmentSchema.index({ status: 1, dueDate: 1 });

module.exports = mongoose.model('installment', installmentSchema)
