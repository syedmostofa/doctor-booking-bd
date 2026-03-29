const { validationResult } = require('express-validator');
const pool = require('../db/pool');

const bookAppointment = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { slot_id, notes } = req.body;

    await client.query('BEGIN');

    // Lock the slot row to prevent double-booking
    const slotResult = await client.query(
      'SELECT * FROM slots WHERE id = $1 FOR UPDATE',
      [slot_id]
    );

    if (slotResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Slot not found.' });
    }

    const slot = slotResult.rows[0];
    if (slot.is_booked) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Slot is already booked.' });
    }

    const appointment = await client.query(
      `INSERT INTO appointments (patient_id, doctor_id, slot_id, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, slot.doctor_id, slot_id, notes]
    );

    await client.query('UPDATE slots SET is_booked = TRUE WHERE id = $1', [slot_id]);

    await client.query('COMMIT');
    res.status(201).json({ appointment: appointment.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

const getMyAppointments = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    let query, params;

    if (role === 'patient') {
      query = `
        SELECT a.id, a.status, a.notes, a.created_at,
               s.slot_date, s.start_time, s.end_time,
               u.name AS doctor_name, d.specialization, d.consultation_fee, d.district
        FROM appointments a
        JOIN slots s ON a.slot_id = s.id
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users u ON d.user_id = u.id
        WHERE a.patient_id = $1
        ORDER BY s.slot_date DESC, s.start_time DESC
      `;
      params = [id];
    } else if (role === 'doctor') {
      query = `
        SELECT a.id, a.status, a.notes, a.created_at,
               s.slot_date, s.start_time, s.end_time,
               u.name AS patient_name, u.phone AS patient_phone
        FROM appointments a
        JOIN slots s ON a.slot_id = s.id
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users u ON a.patient_id = u.id
        WHERE d.user_id = $1
        ORDER BY s.slot_date DESC, s.start_time DESC
      `;
      params = [id];
    } else {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const result = await pool.query(query, params);
    res.json({ appointments: result.rows });
  } catch (err) {
    next(err);
  }
};

const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT a.id, a.status, a.notes, a.created_at,
              s.slot_date, s.start_time, s.end_time,
              d.specialization, d.consultation_fee, d.district,
              doc_user.name AS doctor_name,
              pat_user.name AS patient_name, pat_user.phone AS patient_phone
       FROM appointments a
       JOIN slots s ON a.slot_id = s.id
       JOIN doctors d ON a.doctor_id = d.id
       JOIN users doc_user ON d.user_id = doc_user.id
       JOIN users pat_user ON a.patient_id = pat_user.id
       WHERE a.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    const appointment = result.rows[0];
    // Only the patient, the doctor, or an admin can view
    if (
      req.user.role !== 'admin' &&
      req.user.id !== appointment.patient_id &&
      req.user.role !== 'doctor'
    ) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json({ appointment });
  } catch (err) {
    next(err);
  }
};

const cancelAppointment = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    await client.query('BEGIN');

    const result = await client.query(
      `SELECT a.id, a.status, a.patient_id, a.slot_id, d.user_id AS doctor_user_id
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.id = $1
       FOR UPDATE`,
      [id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    const appt = result.rows[0];
    const isPatient = req.user.id === appt.patient_id;
    const isDoctor = req.user.id === appt.doctor_user_id;
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Not authorized to cancel this appointment.' });
    }

    if (appt.status === 'cancelled') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Appointment is already cancelled.' });
    }

    await client.query(
      `UPDATE appointments SET status = 'cancelled', updated_at = NOW() WHERE id = $1`,
      [id]
    );
    await client.query('UPDATE slots SET is_booked = FALSE WHERE id = $1', [appt.slot_id]);

    await client.query('COMMIT');
    res.json({ message: 'Appointment cancelled successfully.' });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

module.exports = { bookAppointment, getMyAppointments, getAppointmentById, cancelAppointment };
