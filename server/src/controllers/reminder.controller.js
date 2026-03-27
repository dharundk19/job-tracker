const Reminder = require('../models/Reminder.model');

exports.getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user._id })
      .populate('job', 'company role')
      .sort({ reminderDate: 1 });
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createReminder = async (req, res) => {
  try {
    const { jobId, reminderDate, message } = req.body;
    if (!jobId || !reminderDate || !message)
      return res.status(400).json({ message: 'jobId, reminderDate and message required' });

    const reminder = await Reminder.create({
      user: req.user._id,
      job: jobId,
      reminderDate,
      message,
    });
    const populated = await reminder.populate('job', 'company role');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteReminder = async (req, res) => {
  try {
    await Reminder.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Reminder deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
