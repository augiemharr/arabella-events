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
  menu_selection JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Bookings policies (safe to re-run)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous inserts' AND tablename = 'bookings') THEN
    CREATE POLICY "Allow anonymous inserts" ON bookings FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated reads' AND tablename = 'bookings') THEN
    CREATE POLICY "Allow authenticated reads" ON bookings FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated updates' AND tablename = 'bookings') THEN
    CREATE POLICY "Allow authenticated updates" ON bookings FOR UPDATE USING (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated deletes' AND tablename = 'bookings') THEN
    CREATE POLICY "Allow authenticated deletes" ON bookings FOR DELETE USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Create gallery table
CREATE TABLE IF NOT EXISTS gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  src TEXT NOT NULL,
  alt TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'General',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Gallery policies (safe to re-run)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous reads' AND tablename = 'gallery') THEN
    CREATE POLICY "Allow anonymous reads" ON gallery FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated inserts' AND tablename = 'gallery') THEN
    CREATE POLICY "Allow authenticated inserts" ON gallery FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated updates' AND tablename = 'gallery') THEN
    CREATE POLICY "Allow authenticated updates" ON gallery FOR UPDATE USING (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated deletes' AND tablename = 'gallery') THEN
    CREATE POLICY "Allow authenticated deletes" ON gallery FOR DELETE USING (auth.role() = 'authenticated');
  END IF;
END $$;
