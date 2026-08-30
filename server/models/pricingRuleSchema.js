const mongoose = require('mongoose')

// ====== A rate override for a date range, a weekday, or both
// Without this a listing carries one flat rate forever, which is the single
// biggest revenue gap against any real short-term platform.
const pricingRuleSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "property",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    // ====== Season window. Leave empty to apply all year.
    startDate: Date,
    endDate: Date,

    // ====== 0 = Sunday. Empty means every day in the window.
    daysOfWeek: [Number],

    nightlyRate: Number,
    monthlyRate: Number,

    // Highest priority wins when two rules cover the same night
    priority: {
      type: Number,
      default: 0,
    },

    minStayNights: Number,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

pricingRuleSchema.index({ property: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('pricingRule', pricingRuleSchema)
