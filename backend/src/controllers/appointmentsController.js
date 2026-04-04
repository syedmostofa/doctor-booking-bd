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

    // Notify doctor about new booking
    const doctorUserResult = await client.query(
      'SELECT user_id FROM doctors WHERE id = $1', [slot.doctor_id]
    );
    if (doctorUserResult.rows.length > 0) {
      await client.query(
        `INSERT INTO notifications (user_id, type, title, message, metadata)
         VALUES ($1, 'appointment_booked', 'New Appointment', 'A patient has booked an appointment with you.', $2)`,
        [doctorUserResult.rows[0].user_id, JSON.stringify({ appointment_id: appointment.rows[0].id })]
      );
    }

    // Notify patient about booking confirmation
    await client.query(
      `INSERT INTO notifications (user_id, type, title, message, metadata)
       VALUES ($1, 'appointment_booked', 'Appointment Booked', 'Your appointment has been booked successfully. Waiting for doctor confirmation.', $2)`,
      [req.user.id, JSON.stringify({ appointment_id: appointment.rows[0].id })]
    );

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

    // Notify the other party about cancellation
    const notifyUserId = isPatient ? appt.doctor_user_id : appt.patient_id;
    const cancelledBy = isPatient ? 'patient' : 'doctor';
    await client.query(
      `INSERT INTO notifications (user_id, type, title, message, metadata)
       VALUES ($1, 'appointment_cancelled', 'Appointment Cancelled', $2, $3)`,
      [
        notifyUserId,
        `An appointment has been cancelled by the ${cancelledBy}.`,
        JSON.stringify({ appointment_id: id })
      ]
    );

    await client.query('COMMIT');
    res.json({ message: 'Appointment cancelled successfully.' });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

const updateAppointmentStatus = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['confirmed', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Status must be confirmed or completed.' });
    }

    await client.query('BEGIN');

    const result = await client.query(
      `SELECT a.id, a.status, a.patient_id, a.slot_id, d.user_id AS doctor_user_id, d.id AS doctor_id
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
    const isDoctor = req.user.id === appt.doctor_user_id;
    const isAdmin = req.user.role === 'admin';

    if (!isDoctor && !isAdmin) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Only the doctor or admin can update appointment status.' });
    }

    if (appt.status === 'cancelled') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cannot update a cancelled appointment.' });
    }

    if (status === 'confirmed' && appt.status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Only pending appointments can be confirmed.' });
    }

    if (status === 'completed' && appt.status !== 'confirmed') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Only confirmed appointments can be completed.' });
    }

    await client.query(
      `UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status, id]
    );

    // Create notification for patient
    const notifTitle = status === 'confirmed' ? 'Appointment Confirmed' : 'Appointment Completed';
    const notifMessage = status === 'confirmed'
      ? 'Your appointment has been confirmed by the doctor.'
      : 'Your appointment has been marked as completed.';

    await client.query(
      `INSERT INTO notifications (user_id, type, title, message, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [appt.patient_id, `appointment_${status}`, notifTitle, notifMessage, JSON.stringify({ appointment_id: id })]
    );

    await client.query('COMMIT');
    res.json({ message: `Appointment ${status} successfully.` });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

const getAllAppointments = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }

    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT a.id, a.status, a.notes, a.created_at,
             s.slot_date, s.start_time, s.end_time,
             doc_user.name AS doctor_name, d.specialization,
             pat_user.name AS patient_name, pat_user.email AS patient_email
      FROM appointments a
      JOIN slots s ON a.slot_id = s.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users doc_user ON d.user_id = doc_user.id
      JOIN users pat_user ON a.patient_id = pat_user.id
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` WHERE a.status = $${params.length}`;
    }

    // Count total
    const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) FROM');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    query += ' ORDER BY a.created_at DESC';
    params.push(limit);
    query += ` LIMIT $${params.length}`;
    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const result = await pool.query(query, params);
    res.json({
      appointments: result.rows,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { bookAppointment, getMyAppointments, getAppointmentById, cancelAppointment, updateAppointmentStatus, getAllAppointments };
