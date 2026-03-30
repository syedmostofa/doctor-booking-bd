-- Seed data for Doctor Appointment Booking System
-- Inserts 5 sample doctors across Sylhet, Dhaka, and Chittagong

-- Insert doctor user accounts (role = 'doctor')
INSERT INTO users (id, name, email, password_hash, role, phone) VALUES
    ('a1000000-0000-0000-0000-000000000001', 'Dr. Farhan Ahmed',    'farhan.ahmed@example.com',    '$2b$10$examplehashedpassword1', 'doctor', '01711000001'),
    ('a1000000-0000-0000-0000-000000000002', 'Dr. Nusrat Jahan',   'nusrat.jahan@example.com',   '$2b$10$examplehashedpassword2', 'doctor', '01711000002'),
    ('a1000000-0000-0000-0000-000000000003', 'Dr. Kamal Hossain',  'kamal.hossain@example.com',  '$2b$10$examplehashedpassword3', 'doctor', '01711000003'),
    ('a1000000-0000-0000-0000-000000000004', 'Dr. Sumaiya Khanam', 'sumaiya.khanam@example.com', '$2b$10$examplehashedpassword4', 'doctor', '01711000004'),
    ('a1000000-0000-0000-0000-000000000005', 'Dr. Rafiqul Islam',  'rafiqul.islam@example.com',  '$2b$10$examplehashedpassword5', 'doctor', '01711000005');

-- Insert doctor profiles linked to the users above
INSERT INTO doctors (id, user_id, specialty, location, chamber_address, consultation_fee, bio, experience_years) VALUES
    (
        'b1000000-0000-0000-0000-000000000001',
        'a1000000-0000-0000-0000-000000000001',
        'Cardiology',
        'Dhaka',
        'Labaid Cardiac Hospital, Dhanmondi, Dhaka',
        800,
        'Dr. Farhan Ahmed is a consultant cardiologist with expertise in interventional cardiology and heart failure management.',
        12
    ),
    (
        'b1000000-0000-0000-0000-000000000002',
        'a1000000-0000-0000-0000-000000000002',
        'Dentistry',
        'Sylhet',
        'Sylhet Dental Care, Zindabazar, Sylhet',
        500,
        'Dr. Nusrat Jahan specializes in cosmetic and restorative dentistry with over 8 years of clinical experience in Sylhet.',
        8
    ),
    (
        'b1000000-0000-0000-0000-000000000003',
        'a1000000-0000-0000-0000-000000000003',
        'General Practice',
        'Chittagong',
        'Chittagong General Clinic, Agrabad, Chittagong',
        300,
        'Dr. Kamal Hossain is a general practitioner providing comprehensive primary care services to patients of all ages.',
        15
    ),
    (
        'b1000000-0000-0000-0000-000000000004',
        'a1000000-0000-0000-0000-000000000004',
        'Dermatology',
        'Sylhet',
        'Skin & Care Center, Amberkhana, Sylhet',
        600,
        'Dr. Sumaiya Khanam is a dermatologist focusing on skin disorders, cosmetic procedures, and hair treatment.',
        10
    ),
    (
        'b1000000-0000-0000-0000-000000000005',
        'a1000000-0000-0000-0000-000000000005',
        'Orthopedics',
        'Dhaka',
        'National Orthopedic Hospital, Sher-e-Bangla Nagar, Dhaka',
        900,
        'Dr. Rafiqul Islam is an orthopedic surgeon specializing in joint replacement, sports injuries, and spinal disorders.',
        18
    );

-- Insert sample availability slots for each doctor (next 2 days)
INSERT INTO availability_slots (doctor_id, date, start_time, end_time, is_booked) VALUES
    ('b1000000-0000-0000-0000-000000000001', CURRENT_DATE + 1, '09:00', '09:30', FALSE),
    ('b1000000-0000-0000-0000-000000000001', CURRENT_DATE + 1, '09:30', '10:00', FALSE),
    ('b1000000-0000-0000-0000-000000000001', CURRENT_DATE + 2, '11:00', '11:30', FALSE),

    ('b1000000-0000-0000-0000-000000000002', CURRENT_DATE + 1, '10:00', '10:30', FALSE),
    ('b1000000-0000-0000-0000-000000000002', CURRENT_DATE + 1, '10:30', '11:00', FALSE),
    ('b1000000-0000-0000-0000-000000000002', CURRENT_DATE + 2, '14:00', '14:30', FALSE),

    ('b1000000-0000-0000-0000-000000000003', CURRENT_DATE + 1, '08:00', '08:30', FALSE),
    ('b1000000-0000-0000-0000-000000000003', CURRENT_DATE + 1, '08:30', '09:00', FALSE),
    ('b1000000-0000-0000-0000-000000000003', CURRENT_DATE + 2, '09:00', '09:30', FALSE),

    ('b1000000-0000-0000-0000-000000000004', CURRENT_DATE + 1, '15:00', '15:30', FALSE),
    ('b1000000-0000-0000-0000-000000000004', CURRENT_DATE + 2, '15:00', '15:30', FALSE),
    ('b1000000-0000-0000-0000-000000000004', CURRENT_DATE + 2, '15:30', '16:00', FALSE),

    ('b1000000-0000-0000-0000-000000000005', CURRENT_DATE + 1, '13:00', '13:30', FALSE),
    ('b1000000-0000-0000-0000-000000000005', CURRENT_DATE + 1, '13:30', '14:00', FALSE),
    ('b1000000-0000-0000-0000-000000000005', CURRENT_DATE + 2, '16:00', '16:30', FALSE);
