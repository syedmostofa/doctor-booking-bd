const { validationResult } = require('express-validator');
const pool = require('../db/pool');

const createPayment = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { appointment_id, method } = req.body;

    await client.query('BEGIN');

    // Verify appointment belongs to patient
    const apptResult = await client.query(
      `SELECT a.id, a.patient_id, a.status, d.consultation_fee, d.user_id AS doctor_user_id
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.id = $1 FOR UPDATE`,
      [appointment_id]
    );

    if (apptResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    const appt = apptResult.rows[0];
    if (appt.patient_id !== req.user.id) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Not authorized.' });
    }

    if (appt.status === 'cancelled') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cannot pay for a cancelled appointment.' });
    }

    // Check if already paid
    const existingPayment = await client.query(
      `SELECT id FROM payments WHERE appointment_id = $1 AND status = 'completed'`,
      [appointment_id]
    );
    if (existingPayment.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Payment already completed for this appointment.' });
    }

    const amount = appt.consultation_fee || 500;
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // For cash, mark as pending. For digital methods, simulate completion.
    const paymentStatus = method === 'cash' ? 'pending' : 'completed';

    const result = await client.query(
      `INSERT INTO payments (appointment_id, patient_id, amount, method, status, transaction_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [appointment_id, req.user.id, amount, method, paymentStatus, transactionId]
    );

    // Notify doctor about payment
    if (paymentStatus === 'completed') {
      await client.query(
        `INSERT INTO notifications (user_id, type, title, message, metadata)
         VALUES ($1, 'payment_received', 'Payment Received', $2, $3)`,
        [
          appt.doctor_user_id,
          `Payment of ৳${amount} received via ${method}.`,
          JSON.stringify({ payment_id: result.rows[0].id, appointment_id })
        ]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ payment: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

const getPaymentByAppointment = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;

    const result = await pool.query(
      `SELECT p.*, u.name AS patient_name
       FROM payments p
       JOIN users u ON p.patient_id = u.id
       WHERE p.appointment_id = $1
       ORDER BY p.created_at DESC
       LIMIT 1`,
      [appointmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No payment found for this appointment.' });
    }

    const payment = result.rows[0];
    if (payment.patient_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    res.json({ payment: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const getMyPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM payments WHERE patient_id = $1',
      [req.user.id]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT p.*, doc_user.name AS doctor_name, d.specialization,
              s.slot_date, s.start_time
       FROM payments p
       JOIN appointments a ON p.appointment_id = a.id
       JOIN doctors d ON a.doctor_id = d.id
       JOIN users doc_user ON d.user_id = doc_user.id
       JOIN slots s ON a.slot_id = s.id
       WHERE p.patient_id = $1
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    res.json({
      payments: result.rows,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createPayment, getPaymentByAppointment, getMyPayments };
