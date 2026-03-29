const express = require('express');
const { body } = require('express-validator');
const {
  getAllDoctors,
  getDoctorById,
  createDoctorProfile,
  updateDoctorProfile,
} = require('../controllers/doctorsController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

const doctorProfileValidation = [
  body('specialization').trim().notEmpty().withMessage('Specialization is required.'),
  body('qualification').trim().notEmpty().withMessage('Qualification is required.'),
  body('experience_years').isInt({ min: 0 }).withMessage('Experience years must be a non-negative integer.'),
  body('consultation_fee').isFloat({ min: 0 }).withMessage('Consultation fee must be a non-negative number.'),
  body('district').trim().notEmpty().withMessage('District is required.'),
];

// GET /api/v1/doctors
router.get('/', getAllDoctors);

// GET /api/v1/doctors/:id
router.get('/:id', getDoctorById);

// POST /api/v1/doctors  (doctor creates own profile)
router.post('/', authenticate, authorizeRoles('doctor'), doctorProfileValidation, createDoctorProfile);

// PATCH /api/v1/doctors/:id
router.patch('/:id', authenticate, authorizeRoles('doctor', 'admin'), doctorProfileValidation, updateDoctorProfile);

module.exports = router;
