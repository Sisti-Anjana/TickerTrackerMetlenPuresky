-- FIX LOGIN ISSUES (RLS POLICY)
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/tlnojwnrvvrnujnhdlrr/sql

-- 1. Enable RLS (good practice, ensuring we don't leave it disabled from previous attempts)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. Create a policy to allow anyone to read the users table (required for login to find the user)
-- Note: In a production app with a Service Key, this wouldn't be needed.
-- But without the Service Key, we need to allow the Anon key to find users.
DROP POLICY IF EXISTS "Allow public read access" ON users;
CREATE POLICY "Allow public read access" ON users
  FOR SELECT USING (true);

-- 3. Allow users to update their own data (e.g. change password)
DROP POLICY IF EXISTS "Allow individuals to update their own data" ON users;
CREATE POLICY "Allow individuals to update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 4. Verify the policies
SELECT * FROM pg_policies WHERE tablename = 'users';

-- 5. Check if admin user exists (optional, just for info)
SELECT count(*) as user_count FROM users;
