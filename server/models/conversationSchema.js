const mongoose = require('mongoose')

const convSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'user'
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },
    lastMessage: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('convSchema', convSchema)
