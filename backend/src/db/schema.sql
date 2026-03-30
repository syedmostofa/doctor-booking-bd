-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enums
CREATE TYPE user_role AS ENUM ('patient', 'doctor');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role          user_role NOT NULL DEFAULT 'patient',
    phone         VARCHAR(20),
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialty           VARCHAR(100) NOT NULL,
    location            VARCHAR(150) NOT NULL,
    chamber_address     TEXT,
    consultation_fee    INTEGER,
    bio                 TEXT,
    profile_picture_url TEXT,
    experience_years    INTEGER,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Availability slots table
CREATE TABLE IF NOT EXISTS availability_slots (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id  UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    date       DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time   TIME NOT NULL,
    is_booked  BOOLEAN NOT NULL DEFAULT FALSE
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id  UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    slot_id    UUID NOT NULL REFERENCES availability_slots(id) ON DELETE CASCADE,
    status     appointment_status NOT NULL DEFAULT 'pending',
    notes      TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_doctors_specialty        ON doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_doctors_location         ON doctors(location);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id  ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id   ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_slots_doctor_id_date     ON availability_slots(doctor_id, date);
