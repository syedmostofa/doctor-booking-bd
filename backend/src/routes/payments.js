const express = require('express');
const { body } = require('express-validator');
const { createPayment, getPaymentByAppointment, getMyPayments } = require('../controllers/paymentsController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/v1/payments
router.post(
  '/',
  authenticate,
  authorizeRoles('patient'),
  [
    body('appointment_id').isUUID().withMessage('Valid appointment ID is required.'),
    body('method').isIn(['bkash', 'nagad', 'card', 'cash']).withMessage('Payment method must be bkash, nagad, card, or cash.'),
  ],
  createPayment
);

// GET /api/v1/payments/my
router.get('/my', authenticate, getMyPayments);

// GET /api/v1/payments/appointment/:appointmentId
router.get('/appointment/:appointmentId', authenticate, getPaymentByAppointment);

module.exports = router;
