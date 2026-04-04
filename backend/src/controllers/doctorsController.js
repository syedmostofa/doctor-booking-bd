const { validationResult } = require('express-validator');
const pool = require('../db/pool');

const getAllDoctors = async (req, res, next) => {
  try {
    const { specialization, district, search, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    let baseWhere = ' WHERE 1=1';
    const params = [];

    if (specialization) {
      params.push(specialization);
      baseWhere += ` AND d.specialization ILIKE $${params.length}`;
    }
    if (district) {
      params.push(district);
      baseWhere += ` AND d.district ILIKE $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      baseWhere += ` AND (u.name ILIKE $${params.length} OR d.specialization ILIKE $${params.length})`;
    }

    // Count total
    const countQuery = `SELECT COUNT(*) FROM doctors d JOIN users u ON d.user_id = u.id ${baseWhere}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Get avg ratings via subquery
    let query = `
      SELECT d.id, d.specialization, d.qualification, d.experience_years,
             d.consultation_fee, d.district, d.bio, d.available,
             u.name, u.email, u.phone,
             COALESCE(r.avg_rating, 0) AS avg_rating,
             COALESCE(r.total_reviews, 0) AS total_reviews
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      LEFT JOIN (
        SELECT doctor_id, AVG(rating)::NUMERIC(2,1) AS avg_rating, COUNT(*) AS total_reviews
        FROM reviews GROUP BY doctor_id
      ) r ON r.doctor_id = d.id
      ${baseWhere}
      ORDER BY u.name ASC
    `;

    params.push(limit);
    query += ` LIMIT $${params.length}`;
    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const result = await pool.query(query, params);
    res.json({
      doctors: result.rows,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    next(err);
  }
};

const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT d.id, d.specialization, d.qualification, d.experience_years,
              d.consultation_fee, d.district, d.bio, d.available,
              u.name, u.email, u.phone
       FROM doctors d
       JOIN users u ON d.user_id = u.id
       WHERE d.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Doctor not found.' });
    }
    res.json({ doctor: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const createDoctorProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { specialization, qualification, experience_years, consultation_fee, district, bio } = req.body;

    const existing = await pool.query('SELECT id FROM doctors WHERE user_id = $1', [req.user.id]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Doctor profile already exists.' });
    }

    const result = await pool.query(
      `INSERT INTO doctors (user_id, specialization, qualification, experience_years, consultation_fee, district, bio)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.id, specialization, qualification, experience_years, consultation_fee, district, bio]
    );

    res.status(201).json({ doctor: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const updateDoctorProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { specialization, qualification, experience_years, consultation_fee, district, bio, available } = req.body;

    const existing = await pool.query('SELECT user_id FROM doctors WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Doctor not found.' });
    }
    if (existing.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this profile.' });
    }

    const result = await pool.query(
      `UPDATE doctors
       SET specialization = COALESCE($1, specialization),
           qualification = COALESCE($2, qualification),
           experience_years = COALESCE($3, experience_years),
           consultation_fee = COALESCE($4, consultation_fee),
           district = COALESCE($5, district),
           bio = COALESCE($6, bio),
           available = COALESCE($7, available),
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [specialization, qualification, experience_years, consultation_fee, district, bio, available, id]
    );

    res.json({ doctor: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllDoctors, getDoctorById, createDoctorProfile, updateDoctorProfile };
