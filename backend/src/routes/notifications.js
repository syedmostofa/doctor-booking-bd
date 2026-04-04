const express = require('express');
const { getMyNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationsController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/v1/notifications
router.get('/', authenticate, getMyNotifications);

// PATCH /api/v1/notifications/read-all
router.patch('/read-all', authenticate, markAllAsRead);

// PATCH /api/v1/notifications/:id/read
router.patch('/:id/read', authenticate, markAsRead);

module.exports = router;
