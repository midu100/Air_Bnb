const mongoose = require('mongoose')

const destinationSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      required: true,
      trim: true,
    },

    // The flag is an emoji rather than an image so the card carries no extra
    // request, and an editor can paste one straight into the admin form
    flag: {
      type: String,
      trim: true,
      default: '',
    },

    image: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // The first two cards on the home page are twice the size of the rest, so
    // the order an editor sets here decides which destinations get them
    order: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('destination', destinationSchema)
