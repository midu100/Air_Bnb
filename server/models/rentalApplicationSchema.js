const mongoose = require('mongoose')

// ====== A long-term rental application
// Reusable across listings - the applicant fills their profile once and submits it.
const rentalApplicationSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "property",
      required: true,
    },

    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    // ====== Everyone who will live there or stand behind the rent
    coApplicants: [
      {
        fullName: String,
        email: String,
        relationship: String,
      },
    ],

    guarantor: {
      fullName: String,
      email: String,
      phone: String,
    },

    // ====== What a landlord actually decides on
    employmentStatus: {
      type: String,
      enum: ["employed", "self-employed", "student", "retired", "unemployed"],
    },

    employer: String,
    jobTitle: String,
    monthlyIncome: Number,
    currentAddress: String,

    rentalHistory: [
      {
        address: String,
        landlordName: String,
        landlordContact: String,
        fromDate: Date,
        toDate: Date,
      },
    ],

    desiredMoveIn: Date,
    desiredTermMonths: Number,
    pets: String,
    message: String,

    // ====== Screening only runs once the applicant has explicitly agreed
    screeningConsent: {
      given: { type: Boolean, default: false },
      givenAt: Date,
      ip: String,
    },

    screening: {
      status: {
        type: String,
        enum: ["not_started", "pending", "complete", "failed"],
        default: "not_started",
      },
      provider: String,
      reference: String,
      creditScore: Number,
      completedAt: Date,
    },

    status: {
      type: String,
      enum: ["submitted", "screening", "approved", "declined", "withdrawn"],
      default: "submitted",
    },

    // Some jurisdictions require the reason to be given to the applicant
    declineReason: String,
  },
  {
    timestamps: true,
  }
);

rentalApplicationSchema.index({ property: 1, applicant: 1 });

module.exports = mongoose.model('rentalApplication', rentalApplicationSchema)
