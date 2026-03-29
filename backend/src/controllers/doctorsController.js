const { validationResult } = require('express-validator');
const pool = require('../db/pool');

const getAllDoctors = async (req, res, next) => {
  try {
    const { specialization, district, search } = req.query;

    let query = `
      SELECT d.id, d.specialization, d.qualification, d.experience_years,
             d.consultation_fee, d.district, d.bio, d.available,
             u.name, u.email, u.phone
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (specialization) {
      params.push(specialization);
      query += ` AND d.specialization ILIKE $${params.length}`;
    }
    if (district) {
      params.push(district);
      query += ` AND d.district ILIKE $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (u.name ILIKE $${params.length} OR d.specialization ILIKE $${params.length})`;
    }

    query += ' ORDER BY u.name ASC';

    const result = await pool.query(query, params);
    res.json({ doctors: result.rows });
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
