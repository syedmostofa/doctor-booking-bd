# doctor-booking-bd

A web app for booking doctor appointments in Bangladesh. Patients can browse doctors by specialty or district, check available slots, and book appointments. Doctors can manage their profiles and time slots.

Frontend is still in progress — right now only the backend API is ready.

---

## Tech Stack

- **Backend:** Node.js, Express 5
- **Database:** PostgreSQL
- **Auth:** JWT + bcrypt
- **Validation:** express-validator

---

## Getting Started

### Requirements

- Node.js 18+
- PostgreSQL 14+

### Setup

```bash
cd backend
cp .env.example .env
# fill in your values in .env
npm install
npm run dev
```

### Environment Variables

| Variable | What it's for |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `JWT_SECRET` | Secret for signing JWTs — make it long and random |
| `PORT` | Port to run the server on (default: 5000) |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_ORIGIN` | Frontend URL for CORS (optional) |

### Database

Run the schema and seed files to get started:

```bash
psql -d your_database -f backend/src/db/schema.sql
psql -d your_database -f backend/src/db/seed.sql  # optional, loads sample doctors
```

---

## API Overview

Base path: `/api/v1`

**Auth** — `/api/v1/auth`
- `POST /register` — create an account (patient or doctor)
- `POST /login` — get a JWT token
- `GET /me` — fetch your profile (requires token)

**Doctors** — `/api/v1/doctors`
- `GET /` — list doctors, supports `?specialization=`, `?district=`, `?search=`
- `GET /:id` — get a doctor's profile
- `POST /` — create your doctor profile (doctor only)
- `PATCH /:id` — update your profile (doctor only)

**Slots** — `/api/v1/slots`
- `GET /doctor/:doctorId` — see available slots for a doctor, supports `?date=`
- `POST /` — add a slot to your schedule (doctor only)
- `DELETE /:id` — remove a slot (doctor only, can't delete if already booked)

**Appointments** — `/api/v1/appointments`
- `POST /` — book an appointment (patient only)
- `GET /my` — your appointments
- `GET /:id` — single appointment details
- `PATCH /:id/cancel` — cancel an appointment

**Health check** — `GET /health`

---

## Notes

- Appointments use row-level locking in Postgres to prevent double-bookings
- Phone number validation follows Bangladeshi number formats (`01XXXXXXXXX`)
- Tokens expire after 7 days
