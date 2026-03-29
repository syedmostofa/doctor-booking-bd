const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/v1/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Valid email is required.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
    body('phone')
      .matches(/^(\+880|880|0)?1[3-9]\d{8}$/)
      .withMessage('Valid Bangladeshi phone number is required.'),
    body('role').optional().isIn(['patient', 'doctor']).withMessage('Role must be patient or doctor.'),
  ],
  register
);

// POST /api/v1/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  login
);

// GET /api/v1/auth/me
router.get('/me', authenticate, getMe);

module.exports = router;
