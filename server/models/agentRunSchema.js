const mongoose = require('mongoose')

// ====== An audit trail of what the assistant did
// Every turn is recorded: what was asked, which reads ran, what was proposed,
// and what the host later confirmed. Nothing the assistant changes is invisible.
const agentRunSchema = new mongoose.Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    question: {
      type: String,
      required: true,
    },

    answer: String,

    // Reads that ran inside the loop
    reads: [
      {
        tool: String,
        args: mongoose.Schema.Types.Mixed,
        ok: Boolean,
        error: String,
      },
    ],

    // Writes the model asked for. None of these ran when they were recorded.
    proposals: [
      {
        tool: String,
        args: mongoose.Schema.Types.Mixed,
        summary: String,
        status: {
          type: String,
          enum: ["proposed", "confirmed", "declined", "failed"],
          default: "proposed",
        },
        result: mongoose.Schema.Types.Mixed,
        error: String,
        decidedAt: Date,
      },
    ],

    rounds: {
      type: Number,
      default: 0,
    },

    error: String,
  },
  {
    timestamps: true,
  }
);

agentRunSchema.index({ host: 1, createdAt: -1 });

module.exports = mongoose.model('agentRun', agentRunSchema)
