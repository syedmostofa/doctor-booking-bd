const express = require('express');
const { body } = require('express-validator');
const {
  bookAppointment,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
} = require('../controllers/appointmentsController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/v1/appointments  (patient books)
router.post(
  '/',
  authenticate,
  authorizeRoles('patient'),
  [
    body('slot_id').isInt({ min: 1 }).withMessage('Valid slot ID is required.'),
    body('notes').optional().isString().isLength({ max: 500 }),
  ],
  bookAppointment
);

// GET /api/v1/appointments/my  (patient or doctor views their own)
router.get('/my', authenticate, authorizeRoles('patient', 'doctor'), getMyAppointments);

// GET /api/v1/appointments/:id
router.get('/:id', authenticate, getAppointmentById);

// PATCH /api/v1/appointments/:id/cancel
router.patch('/:id/cancel', authenticate, cancelAppointment);

module.exports = router;
