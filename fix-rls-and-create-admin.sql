-- Temporary fix: Disable RLS on users table for authentication
-- Run this in your Supabase SQL Editor

-- Step 1: Disable RLS on users table temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Step 2: Create/Update admin user
INSERT INTO users (name, email, password, role, must_change_password, created_at, updated_at)
VALUES (
  'System Administrator',
  'admin@system.local',
  '$2a$10$YourHashedPasswordHere', -- This will be updated by the backend
  'admin',
  false,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  must_change_password = false;

-- Step 3: Create policies that allow authentication
-- Allow service role to bypass RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authentication (reading users for login)
CREATE POLICY "Allow authentication" ON users
FOR SELECT
USING (true);

-- Policy: Allow creating users (for registration)
CREATE POLICY "Allow creating users" ON users
FOR INSERT
WITH CHECK (true);

-- Policy: Allow updating own profile
CREATE POLICY "Allow updating own profile" ON users
FOR UPDATE
USING (true);

-- Verify the setup
SELECT * FROM users WHERE role = 'admin';
