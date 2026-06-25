const mongoose = require('mongoose')

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
    },

    properties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "property",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('wishlist',wishlistSchema)