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

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    comment: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('review', reviewSchema)