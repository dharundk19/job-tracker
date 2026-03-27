const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getReminders,
  createReminder,
  deleteReminder,
} = require('../controllers/reminder.controller');

router.use(protect);
router.route('/').get(getReminders).post(createReminder);
router.delete('/:id', deleteReminder);

module.exports = router;
