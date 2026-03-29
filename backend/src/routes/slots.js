const express = require('express');
const { body } = require('express-validator');
const { getSlotsByDoctor, createSlot, deleteSlot } = require('../controllers/slotsController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/v1/slots/doctor/:doctorId?date=YYYY-MM-DD
router.get('/doctor/:doctorId', getSlotsByDoctor);

// POST /api/v1/slots  (doctor creates a slot)
router.post(
  '/',
  authenticate,
  authorizeRoles('doctor'),
  [
    body('slot_date').isDate().withMessage('Valid slot date (YYYY-MM-DD) is required.'),
    body('start_time')
      .matches(/^\d{2}:\d{2}$/)
      .withMessage('Start time must be in HH:MM format.'),
    body('end_time')
      .matches(/^\d{2}:\d{2}$/)
      .withMessage('End time must be in HH:MM format.'),
  ],
  createSlot
);

// DELETE /api/v1/slots/:id
router.delete('/:id', authenticate, authorizeRoles('doctor', 'admin'), deleteSlot);

module.exports = router;
