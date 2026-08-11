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
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'pending_deposit', 'deposit_paid', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  deposit_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  deposit_paid BOOLEAN DEFAULT FALSE,
  final_paid BOOLEAN DEFAULT FALSE,
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

-- Allow authenticated deletes (for admin)
CREATE POLICY "Allow authenticated deletes" ON bookings
  FOR DELETE
  USING (auth.role() = 'authenticated');
