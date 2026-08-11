-- Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/tgogbceokcmmhhtwgehd/sql)

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_date DATE,
  pax INTEGER,
  message TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'confirmed', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for the contact form)
CREATE POLICY "Allow anonymous inserts" ON bookings
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated reads (for admin)
CREATE POLICY "Allow authenticated reads" ON bookings
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow authenticated updates (for admin status changes)
CREATE POLICY "Allow authenticated updates" ON bookings
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Create admin user (change email/password to your preference)
-- Go to Authentication > Users in Supabase dashboard and add a user manually
-- OR run this:
-- INSERT INTO auth.users (email, password, email_confirmed_at)
-- VALUES ('admin@arabellaevents.ph', crypt('your-password', gen_salt('bf')), now());
