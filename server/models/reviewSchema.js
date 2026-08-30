const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "property",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "booking",
      required: true,
    },

    // ====== Reviews now run both ways, like every serious platform
    reviewType: {
      type: String,
      enum: ["guest_to_host", "host_to_guest"],
      default: "guest_to_host",
    },

    // Who is being reviewed - the host for a stay, or the guest for their conduct
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    // ====== Sub-ratings, only meaningful on a guest's review of a stay
    categories: {
      cleanliness: { type: Number, min: 1, max: 5 },
      accuracy: { type: Number, min: 1, max: 5 },
      checkIn: { type: Number, min: 1, max: 5 },
      communication: { type: Number, min: 1, max: 5 },
      location: { type: Number, min: 1, max: 5 },
      value: { type: Number, min: 1, max: 5 },
    },

    comment: String,
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ booking: 1, reviewType: 1 }, { unique: true });

module.exports = mongoose.model('review', reviewSchema)