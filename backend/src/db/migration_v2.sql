-- Migration V2: New features
-- Adds: admin role, reviews, password resets, payments, notifications, reminders

-- 1. Update user_role enum to include 'admin'
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';

-- 2. Add updated_at to appointments (used by status changes)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

-- 3. Add updated_at and available to doctors
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS available BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS qualification VARCHAR(200);

-- 4. Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id  UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    rating     INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment    TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(patient_id, doctor_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_doctor_id ON reviews(doctor_id);

-- 5. Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token      VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 6. Payment status enum and payments table
DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('bkash', 'nagad', 'card', 'cash');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS payments (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    patient_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount         INTEGER NOT NULL,
    method         payment_method NOT NULL DEFAULT 'cash',
    status         payment_status NOT NULL DEFAULT 'pending',
    transaction_id VARCHAR(100),
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_appointment_id ON payments(appointment_id);

-- 7. Notifications table
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'appointment_booked', 'appointment_confirmed', 'appointment_cancelled',
        'appointment_completed', 'appointment_reminder', 'payment_received',
        'review_received', 'general'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS notifications (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       notification_type NOT NULL DEFAULT 'general',
    title      VARCHAR(200) NOT NULL,
    message    TEXT NOT NULL,
    is_read    BOOLEAN NOT NULL DEFAULT FALSE,
    metadata   JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- 8. Add specialization and district aliases (the controllers use these column names)
-- These may already exist depending on actual DB state, so we use IF NOT EXISTS
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS specialization VARCHAR(100);
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS district VARCHAR(150);

-- 9. Slots table alias (controllers reference 'slots' not 'availability_slots')
-- Create the slots table if it doesn't exist (controllers use 'slots')
CREATE TABLE IF NOT EXISTS slots (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id  UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    slot_date  DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time   TIME NOT NULL,
    is_booked  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_slots_doctor_date ON slots(doctor_id, slot_date);
