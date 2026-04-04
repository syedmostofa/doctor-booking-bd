const pool = require('../db/pool');

// Get upcoming appointment reminders (appointments within 24 hours)
// This can be called by a cron job or scheduler
const processReminders = async (req, res, next) => {
  try {
    // Find confirmed appointments happening within the next 24 hours
    // that haven't had a reminder sent yet
    const result = await pool.query(
      `SELECT a.id AS appointment_id, a.patient_id, a.doctor_id,
              s.slot_date, s.start_time,
              doc_user.name AS doctor_name,
              d.specialization, d.district
       FROM appointments a
       JOIN slots s ON a.slot_id = s.id
       JOIN doctors d ON a.doctor_id = d.id
       JOIN users doc_user ON d.user_id = doc_user.id
       WHERE a.status = 'confirmed'
         AND (s.slot_date = CURRENT_DATE OR s.slot_date = CURRENT_DATE + INTERVAL '1 day')
         AND NOT EXISTS (
           SELECT 1 FROM notifications n
           WHERE n.user_id = a.patient_id
             AND n.type = 'appointment_reminder'
             AND n.metadata->>'appointment_id' = a.id::text
         )`
    );

    const reminders = result.rows;
    let sentCount = 0;

    for (const r of reminders) {
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, metadata)
         VALUES ($1, 'appointment_reminder', 'Appointment Reminder', $2, $3)`,
        [
          r.patient_id,
          `Reminder: You have an appointment with Dr. ${r.doctor_name} (${r.specialization}) on ${new Date(r.slot_date).toLocaleDateString()} at ${r.start_time}.`,
          JSON.stringify({ appointment_id: r.appointment_id })
        ]
      );
      sentCount++;
    }

    res.json({ message: `${sentCount} reminder(s) sent.`, count: sentCount });
  } catch (err) {
    next(err);
  }
};

// Get upcoming appointments for the current user (patient or doctor)
const getUpcomingReminders = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    let query;

    if (role === 'patient') {
      query = await pool.query(
        `SELECT a.id, a.status, s.slot_date, s.start_time, s.end_time,
                doc_user.name AS doctor_name, d.specialization, d.district
         FROM appointments a
         JOIN slots s ON a.slot_id = s.id
         JOIN doctors d ON a.doctor_id = d.id
         JOIN users doc_user ON d.user_id = doc_user.id
         WHERE a.patient_id = $1
           AND a.status IN ('pending', 'confirmed')
           AND s.slot_date >= CURRENT_DATE
         ORDER BY s.slot_date ASC, s.start_time ASC
         LIMIT 5`,
        [id]
      );
    } else if (role === 'doctor') {
      query = await pool.query(
        `SELECT a.id, a.status, s.slot_date, s.start_time, s.end_time,
                pat_user.name AS patient_name, pat_user.phone AS patient_phone
         FROM appointments a
         JOIN slots s ON a.slot_id = s.id
         JOIN doctors d ON a.doctor_id = d.id
         JOIN users pat_user ON a.patient_id = pat_user.id
         WHERE d.user_id = $1
           AND a.status IN ('pending', 'confirmed')
           AND s.slot_date >= CURRENT_DATE
         ORDER BY s.slot_date ASC, s.start_time ASC
         LIMIT 5`,
        [id]
      );
    } else {
      return res.json({ upcoming: [] });
    }

    res.json({ upcoming: query.rows });
  } catch (err) {
    next(err);
  }
};

module.exports = { processReminders, getUpcomingReminders };
