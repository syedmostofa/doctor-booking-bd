const { validationResult } = require('express-validator');
const pool = require('../db/pool');

const createReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { doctor_id, rating, comment } = req.body;

    // Check doctor exists
    const doctorResult = await pool.query('SELECT id, user_id FROM doctors WHERE id = $1', [doctor_id]);
    if (doctorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Doctor not found.' });
    }

    // Check patient had a completed appointment with this doctor
    const apptResult = await pool.query(
      `SELECT id FROM appointments
       WHERE patient_id = $1 AND doctor_id = $2 AND status = 'completed'
       LIMIT 1`,
      [req.user.id, doctor_id]
    );
    if (apptResult.rows.length === 0) {
      return res.status(400).json({ error: 'You can only review doctors after a completed appointment.' });
    }

    // Check for existing review
    const existing = await pool.query(
      'SELECT id FROM reviews WHERE patient_id = $1 AND doctor_id = $2',
      [req.user.id, doctor_id]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'You have already reviewed this doctor.' });
    }

    const result = await pool.query(
      `INSERT INTO reviews (patient_id, doctor_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, doctor_id, rating, comment || null]
    );

    // Notify doctor
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, metadata)
       VALUES ($1, 'review_received', 'New Review', $2, $3)`,
      [
        doctorResult.rows[0].user_id,
        `A patient gave you a ${rating}-star review.`,
        JSON.stringify({ review_id: result.rows[0].id, doctor_id })
      ]
    );

    res.status(201).json({ review: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const getDoctorReviews = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM reviews WHERE doctor_id = $1',
      [doctorId]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at,
              u.name AS patient_name
       FROM reviews r
       JOIN users u ON r.patient_id = u.id
       WHERE r.doctor_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [doctorId, limit, offset]
    );

    // Get average rating
    const avgResult = await pool.query(
      'SELECT AVG(rating)::NUMERIC(2,1) AS avg_rating, COUNT(*) AS total_reviews FROM reviews WHERE doctor_id = $1',
      [doctorId]
    );

    res.json({
      reviews: result.rows,
      stats: avgResult.rows[0],
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    next(err);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT patient_id FROM reviews WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found.' });
    }

    if (result.rows[0].patient_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this review.' });
    }

    await pool.query('DELETE FROM reviews WHERE id = $1', [id]);
    res.json({ message: 'Review deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createReview, getDoctorReviews, deleteReview };
