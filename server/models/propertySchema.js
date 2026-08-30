const mongoose = require('mongoose')

const propertySchema = new mongoose.Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },

    // ====== Which horizons this property is offered on
    // 'short' = 1-29 nights, 'mid' = 1-11 months, 'long' = 12+ months
    rentalTypes: [
      {
        type: String,
        enum: ["short", "mid", "long"],
      },
    ],

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    propertyType: {
      type: String,
      enum: [
        "Apartment",
        "House",
        "Villa",
        "Cabin",
        "Hotel",
        "Room",
      ],
      required: true,
    },

    thumbnail: {
        type : String,
        required : true
    },
    images : [
        {
            type : String
        }
    ],

    // ====== Short-term rate
    pricePerNight: {
      type: Number,
      required: true,
    },

    minStayNights: {
      type: Number,
      default: 1,
    },

    maxStayNights: {
      type: Number,
      default: 29,
    },

    // ====== Mid-term rate, quoted per month not per night
    monthlyRate: {
      type: Number,
    },

    minStayMonths: {
      type: Number,
      default: 1,
    },

    maxStayMonths: {
      type: Number,
      default: 11,
    },

    // ====== Long-term rent, the basis of a lease
    longTermRent: {
      type: Number,
    },

    minTermMonths: {
      type: Number,
      default: 12,
    },

    securityDeposit: {
      type: Number,
      default: 0,
    },

    utilitiesIncluded: {
      type: Boolean,
      default: false,
    },

    utilityCap: {
      type: Number,
    },

    // ====== Percent off the nightly rate for longer stays
    discounts: {
      weekly: { type: Number, default: 0 },
      monthly: { type: Number, default: 0 },
    },

    furnished: {
      type: String,
      enum: ["furnished", "semi", "unfurnished"],
      default: "furnished",
    },

    availableFrom: {
      type: Date,
    },

    cleaningFee: {
      type: Number,
      default: 0,
    },

    serviceFee: {
      type: Number,
      default: 0,
    },

    maxGuests: {
      type: Number,
      required: true,
    },

    bedrooms: {
      type: Number,
      default: 1,
    },

    beds: {
      type: Number,
      default: 1,
    },

    bathrooms: {
      type: Number,
      default: 1,
    },

    amenities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Amenity",
      },
    ],

    address: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
    },

    country: {
      type: String,
      required: true,
    },

    zipCode: {
        type : String
    },

    coordinates: {
      latitude: Number,
      longitude: Number,
    },

    houseRules: [String],

    // ====== Refund tiers. Cancel used to always be a full refund, so hosts carried all the risk.
    cancellationPolicy: {
      type: String,
      enum: ["flexible", "moderate", "strict", "non_refundable"],
      default: "moderate",
    },

    // ====== Occupancy or tourist tax, charged on top and remitted by the platform
    taxRatePercent: {
      type: Number,
      default: 0,
    },

    // ====== The currency the host is paid in. Guests may view another.
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
    },

    // ====== What decides a multi month stay for a remote worker
    workspace: {
      dedicatedDesk: { type: Boolean, default: false },
      monitor: { type: Boolean, default: false },
      internetSpeedMbps: Number,
      laundryInUnit: { type: Boolean, default: false },
      separateWorkRoom: { type: Boolean, default: false },
    },

    // ====== Calendars imported from other channels so the host is not double booked
    icalUrls: [
      {
        label: String,
        url: String,
        lastSyncedAt: Date,
      },
    ],

    // ====== Local rental registration, displayed publicly where the law requires it
    compliance: {
      registrationNumber: String,
      issuingAuthority: String,
      verifiedAt: Date,
    },

    averageRating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: [
        "draft",
        "published",
        "unpublished",
      ],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("property", propertySchema);