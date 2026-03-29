const { validationResult } = require('express-validator');
const pool = require('../db/pool');

const getSlotsByDoctor = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    let query = `
      SELECT s.id, s.slot_date, s.start_time, s.end_time, s.is_booked
      FROM slots s
      WHERE s.doctor_id = $1
    `;
    const params = [doctorId];

    if (date) {
      params.push(date);
      query += ` AND s.slot_date = $${params.length}`;
    } else {
      query += ` AND s.slot_date >= CURRENT_DATE`;
    }

    query += ' ORDER BY s.slot_date ASC, s.start_time ASC';

    const result = await pool.query(query, params);
    res.json({ slots: result.rows });
  } catch (err) {
    next(err);
  }
};

const createSlot = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { slot_date, start_time, end_time } = req.body;

    const doctorResult = await pool.query('SELECT id FROM doctors WHERE user_id = $1', [req.user.id]);
    if (doctorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Doctor profile not found.' });
    }
    const doctorId = doctorResult.rows[0].id;

    const conflict = await pool.query(
      `SELECT id FROM slots
       WHERE doctor_id = $1 AND slot_date = $2
         AND NOT (end_time <= $3 OR start_time >= $4)`,
      [doctorId, slot_date, start_time, end_time]
    );
    if (conflict.rows.length > 0) {
      return res.status(409).json({ error: 'Time slot conflicts with an existing slot.' });
    }

    const result = await pool.query(
      `INSERT INTO slots (doctor_id, slot_date, start_time, end_time)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [doctorId, slot_date, start_time, end_time]
    );

    res.status(201).json({ slot: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const deleteSlot = async (req, res, next) => {
  try {
    const { id } = req.params;

    const slotResult = await pool.query(
      `SELECT s.id, s.is_booked, d.user_id
       FROM slots s
       JOIN doctors d ON s.doctor_id = d.id
       WHERE s.id = $1`,
      [id]
    );

    if (slotResult.rows.length === 0) {
      return res.status(404).json({ error: 'Slot not found.' });
    }

    const slot = slotResult.rows[0];
    if (slot.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this slot.' });
    }
    if (slot.is_booked) {
      return res.status(400).json({ error: 'Cannot delete a booked slot.' });
    }

    await pool.query('DELETE FROM slots WHERE id = $1', [id]);
    res.json({ message: 'Slot deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSlotsByDoctor, createSlot, deleteSlot };
