const mongoose = require('mongoose')

// ====== One rent charge in a tenancy ledger
// Generated ahead of each due date so both sides can see what is owed and when.
const rentInvoiceSchema = new mongoose.Schema(
  {
    lease: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "lease",
      required: true,
    },

    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
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

    lateFee: {
      type: Number,
      default: 0,
    },

    amountPaid: {
      type: Number,
      default: 0,
    },

    paidAt: Date,

    transactionId: String,

    status: {
      type: String,
      enum: ["upcoming", "due", "paid", "partial", "overdue"],
      default: "upcoming",
    },
  },
  {
    timestamps: true,
  }
);

rentInvoiceSchema.index({ lease: 1, dueDate: 1 });

module.exports = mongoose.model('rentInvoice', rentInvoiceSchema)
