const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema(
  {
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "property",
      required: true,
    },

    // ====== A booking covers short and mid term. Long term lives in leaseSchema.
    rentalType: {
      type: String,
      enum: ["short", "mid"],
      default: "short",
    },

    checkInDate: {
      type: Date,
      required: true,
    },

    checkOutDate: {
      type: Date,
      required: true,
    },

    totalNights: {
      type: Number,
      required: true,
    },

    guestsCount: {
      type: Number,
      required: true,
    },

    pricePerNight: {
      type: Number,
      required: true,
    },

    // ====== Mid-term stays are priced monthly, with any part month prorated
    monthlyRate: {
      type: Number,
    },

    totalMonths: {
      type: Number,
      default: 0,
    },

    discountPercent: {
      type: Number,
      default: 0,
    },

    securityDeposit: {
      type: Number,
      default: 0,
    },

    // ====== Who actually pays. Relocations and travel-nurse stays are
    // frequently billed to an employer or agency, not the occupant.
    payer: {
      type: String,
      enum: ["guest", "company"],
      default: "guest",
    },

    company: {
      name: String,
      contactEmail: String,
      vatNumber: String,
      purchaseOrder: String,
      billingAddress: String,
    },

    // ====== Card kept on file so monthly charges can run without the guest
    stripeCustomerId: String,
    stripePaymentMethodId: String,

    // ====== Next monthly charge for a mid-term stay
    nextChargeDate: {
      type: Date,
    },

    chargeDue: {
      type: Boolean,
      default: false,
    },

    // ====== Short term is paid once. Mid term pays month by month.
    billingCycle: {
      type: String,
      enum: ["upfront", "monthly"],
      default: "upfront",
    },

    cleaningFee: {
      type: Number,
      default: 0,
    },

    serviceFee: {
      type: Number,
      default: 0,
    },

    taxAmount: {
      type: Number,
      default: 0,
    },

    // ====== Discount code applied at checkout
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "coupon",
    },

    couponCode: String,

    couponDiscount: {
      type: Number,
      default: 0,
    },

    // Snapshotted at booking time so a later policy change cannot alter this deal
    cancellationPolicy: {
      type: String,
      enum: ["flexible", "moderate", "strict", "non_refundable"],
      default: "moderate",
    },

    refundAmount: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    bookingStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
      ],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "paid",
        "refunded",
        "failed",
      ],
      default: "pending",
    },

    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ property: 1, checkInDate: 1, checkOutDate: 1 });

module.exports = mongoose.model('booking',bookingSchema)