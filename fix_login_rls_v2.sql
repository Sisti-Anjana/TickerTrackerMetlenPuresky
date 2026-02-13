-- FIX LOGIN ISSUES (RLS POLICY V2)
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/tlnojwnrvvrnujnhdlrr/sql

-- 1. Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. Allow public Read Access
-- This enables the server (using Anon key) to find users by email during login.
DROP POLICY IF EXISTS "Allow public read access" ON users;
CREATE POLICY "Allow public read access" ON users
  FOR SELECT USING (true);

-- 3. Allow public Update Access (REQUIRED for Password Changes)
-- Since we are using Custom Auth (BigInt IDs) and lack the Service Key,
-- we must allow the Anon key to update records.
-- Note: This makes the users table writeable by anyone with the Anon key.
-- This is acceptable for Development, but for Production you should use the Service Key.
DROP POLICY IF EXISTS "Allow public update access" ON users;
CREATE POLICY "Allow public update access" ON users
  FOR UPDATE USING (true);

-- 4. Allow public Insert Access (REQUIRED for Registration)
DROP POLICY IF EXISTS "Allow public insert access" ON users;
CREATE POLICY "Allow public insert access" ON users
  FOR INSERT WITH CHECK (true);

-- 5. Verification
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'users';
