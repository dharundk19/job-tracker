const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    reminderDate: { type: Date, required: true },
    message: { type: String, required: true },
    sent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reminder', reminderSchema);
