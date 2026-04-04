const express = require('express');
const { body } = require('express-validator');
const { createReview, getDoctorReviews, deleteReview } = require('../controllers/reviewsController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/v1/reviews
router.post(
  '/',
  authenticate,
  authorizeRoles('patient'),
  [
    body('doctor_id').isUUID().withMessage('Valid doctor ID is required.'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5.'),
    body('comment').optional().isString().isLength({ max: 1000 }),
  ],
  createReview
);

// GET /api/v1/reviews/doctor/:doctorId
router.get('/doctor/:doctorId', getDoctorReviews);

// DELETE /api/v1/reviews/:id
router.delete('/:id', authenticate, deleteReview);

module.exports = router;
