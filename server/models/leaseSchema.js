const mongoose = require('mongoose')

// ====== A long-term tenancy
// The LTR counterpart to bookingSchema. A booking is paid once and consumed.
// A lease is an ongoing obligation with a signed document, a held deposit and
// rent collected month after month.
const leaseSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "property",
      required: true,
    },

    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    tenants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "rentalApplication",
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    termMonths: {
      type: Number,
      required: true,
    },

    noticePeriodDays: {
      type: Number,
      default: 30,
    },

    // ====== Money
    monthlyRent: {
      type: Number,
      required: true,
    },

    rentDueDay: {
      type: Number,
      default: 1,
    },

    securityDeposit: {
      type: Number,
      default: 0,
    },

    depositStatus: {
      type: String,
      enum: ["pending", "held", "partial", "returned"],
      default: "pending",
    },

    utilitiesIncluded: {
      type: Boolean,
      default: false,
    },

    lateFeeAmount: {
      type: Number,
      default: 0,
    },

    gracePeriodDays: {
      type: Number,
      default: 5,
    },

    // ====== The executed document
    documentUrl: String,

    signatures: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        role: { type: String, enum: ["tenant", "landlord"] },
        signedAt: Date,
        ip: String,
      },
    ],

    status: {
      type: String,
      enum: ["draft", "pending_signature", "active", "notice_given", "ended"],
      default: "draft",
    },

    noticeGivenAt: Date,
    endedAt: Date,
  },
  {
    timestamps: true,
  }
);

leaseSchema.index({ property: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('lease', leaseSchema)
