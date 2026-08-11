-- Seed data for Arabella Events
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/tgogbceokcmmhhtwgehd/sql

INSERT INTO bookings (name, email, phone, event_type, event_date, pax, message, status, deposit_amount, total_amount, deposit_paid, created_at) VALUES

-- Wedding bookings
('Maria Santos & Juan dela Cruz', 'maria.santos@gmail.com', '09171234567', 'Wedding', '2026-08-20', 150, 'Garden wedding reception for 150 pax. Prefer floral centerpieces and fairy lights setup.', 'confirmed', 25000, 120000, true, NOW() - INTERVAL '14 days'),

('Angela Reyes & Mark Gonzales', 'angela.reyes@gmail.com', '09182345678', 'Wedding', '2026-09-12', 200, 'Grand ballroom wedding. Need AV setup and bridal car service.', 'deposit_paid', 30000, 150000, true, NOW() - INTERVAL '7 days'),

('Patricia Lim & David Tan', 'pat.lim@yahoo.com', '09193456789', 'Wedding', '2026-11-05', 100, 'Intimate garden wedding. Minimalist theme, pastel colors.', 'pending_deposit', 20000, 95000, false, NOW() - INTERVAL '3 days'),

-- Birthday party bookings
('Carlo Mendoza', 'carlo.mendoza@gmail.com', '09204567890', 'Birthday Party', '2026-08-15', 80, '80th birthday celebration for my lola. Filipino cuisine, live band.', 'confirmed', 10000, 45000, true, NOW() - INTERVAL '21 days'),

('Sofia Delgado', 'sofia.d@gmail.com', '09215678901', 'Birthday Party', '2026-08-28', 50, 'Sweet 18 debut party. Rose gold theme, photo booth needed.', 'contacted', 0, 35000, false, NOW() - INTERVAL '5 days'),

('The Fernandez Family', 'fernandez.fam@outlook.com', '09226789012', 'Birthday Party', '2026-09-05', 120, 'Kids birthday party with mascots and arcade games.', 'new', 0, 55000, false, NOW() - INTERVAL '1 day'),

-- Corporate event bookings
('TechVibe Solutions Inc.', 'events@techvibe.com.ph', '09237890123', 'Corporate Event', '2026-08-22', 200, 'Annual company Christmas party. Need stage, projector, and sound system.', 'quoted', 0, 180000, false, NOW() - INTERVAL '10 days'),

('MetroBank Regional Office', 'admin.metro@metrobank.com', '09248901234', 'Corporate Event', '2026-10-15', 300, 'Leadership conference and team building. Full day event with lunch and dinner.', 'pending_deposit', 50000, 250000, false, NOW() - INTERVAL '6 days'),

('GreenLeaf Organics', 'info@greenleaf.com.ph', '09259012345', 'Corporate Event', '2026-09-18', 80, 'Product launch event. Need LED wall and product display area.', 'new', 0, 75000, false, NOW() - INTERVAL '2 days'),

-- Family gathering bookings
('The Rodriguez Family', 'rodriguez.family@gmail.com', '09260123456', 'Family Gathering', '2026-08-25', 60, 'Family reunion. BBQ-style buffet, outdoor setup preferred.', 'contacted', 0, 30000, false, NOW() - INTERVAL '8 days'),

('Santos Clan Reunion', 'jun.santos@yahoo.com', '09271234567', 'Family Gathering', '2026-10-01', 80, 'Annual family reunion. Need big venue, buffet for 80 pax.', 'new', 0, 40000, false, NOW() - INTERVAL '4 days'),

-- Christening bookings
('Baby Sofia Cruz Baptism', 'cruzparents@gmail.com', '09282345678', 'Christening', '2026-09-20', 40, 'Baptismal reception after church ceremony. Simple celebration with close family.', 'confirmed', 8000, 25000, true, NOW() - INTERVAL '18 days'),

('Baby Lucas Garcia Christening', 'garcia.family@outlook.com', '09293456789', 'Christening', '2026-08-30', 50, 'Christening reception. Theme: Noah''s Ark. Kids-friendly menu.', 'completed', 5000, 20000, true, NOW() - INTERVAL '30 days'),

-- Debut bookings
('Andrea Villanueva 18th Birthday', 'andrea.v@gmail.com', '09304567890', 'Debut', '2026-11-14', 100, '18th birthday debut. Princess theme, need 18 roses ceremony setup.', 'quoted', 0, 85000, false, NOW() - INTERVAL '9 days'),

-- Cancelled booking
('Roberto Aquino', 'roberto.a@yahoo.com', '09315678901', 'Wedding', '2026-07-30', 100, 'Wedding reception. Postponed due to schedule conflict.', 'cancelled', 0, 0, false, NOW() - INTERVAL '45 days'),

-- Past completed event
('Maria Elena Bautista', 'me.bautista@gmail.com', '09326789012', 'Corporate Event', '2026-06-15', 150, 'Company anniversary party. Great success!', 'completed', 25000, 120000, true, NOW() - INTERVAL '60 days'),

-- More new inquiries
('Camille Ramos', 'camille.ramos@gmail.com', '09337890123', 'Wedding', '2026-12-20', 250, 'December wedding, Christmas theme decorations.', 'new', 0, 180000, false, NOW() - INTERVAL '12 hours'),

('Isabelle Cruz', 'isabelle.c@gmail.com', '09348901234', 'Birthday Party', '2026-09-10', 30, 'Surprise birthday party for my husband. Steakhouse theme.', 'new', 0, 25000, false, NOW() - INTERVAL '6 hours');
