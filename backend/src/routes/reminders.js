const express = require('express');
const { processReminders, getUpcomingReminders } = require('../controllers/remindersController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/v1/reminders/process  (admin or cron trigger)
router.post('/process', authenticate, authorizeRoles('admin'), processReminders);

// GET /api/v1/reminders/upcoming  (get user's upcoming appointments)
router.get('/upcoming', authenticate, getUpcomingReminders);

module.exports = router;
