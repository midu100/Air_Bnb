const mongoose = require('mongoose')

// ====== A date range a host has taken off the market
// Availability used to be derived only from bookings, so a host had no way to
// say "not this week". This is that missing lever.
const availabilitySchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "property",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    reason: {
      type: String,
      enum: ["personal", "maintenance", "external_booking", "other"],
      default: "personal",
    },

    note: String,

    // Set when the block came from an imported iCal feed rather than a person
    externalSource: String,
    externalUid: String,
  },
  {
    timestamps: true,
  }
);

availabilitySchema.index({ property: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('availability', availabilitySchema)
