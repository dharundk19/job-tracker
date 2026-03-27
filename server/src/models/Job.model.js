const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['applied', 'interview', 'offer', 'rejected'],
      default: 'applied',
    },
    notes: { type: String, default: '' },
    resumeUrl: { type: String, default: null },
    tags: [{ type: String, trim: true }],
    salary: { type: String, default: '' },
    location: { type: String, default: '' },
    jobUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

// Indexes for fast user-specific queries
jobSchema.index({ user: 1, status: 1 });
jobSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
