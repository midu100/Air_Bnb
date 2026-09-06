const mongoose = require('mongoose')

// ====== A discount code a guest can apply at checkout
// Scoped so a code can be limited to one host's listings, one rental horizon,
// a date window, a spend floor and a number of uses.
const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    description: String,

    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },

    // Percent off when percentage, an amount off when fixed
    value: {
      type: Number,
      required: true,
      min: 0,
    },

    // Caps a percentage discount so "50% off" cannot take an unbounded amount
    maxDiscount: {
      type: Number,
    },

    // ====== Who and what it applies to
    // Empty properties means every listing the owner has
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    properties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "property",
      },
    ],

    rentalTypes: [
      {
        type: String,
        enum: ["short", "mid", "long"],
      },
    ],

    // ====== Conditions
    minNights: {
      type: Number,
      default: 0,
    },

    minAmount: {
      type: Number,
      default: 0,
    },

    validFrom: Date,
    validUntil: Date,

    // ====== Usage
    maxUses: {
      type: Number,
      default: 0, // 0 means unlimited
    },

    usedCount: {
      type: Number,
      default: 0,
    },

    maxUsesPerUser: {
      type: Number,
      default: 1,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.index({ owner: 1, isActive: 1 });

module.exports = mongoose.model('coupon', couponSchema)
