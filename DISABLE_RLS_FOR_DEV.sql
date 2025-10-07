-- DISABLE RLS FOR DEVELOPMENT
-- This will allow server-side operations without authentication conflicts

-- Temporarily disable RLS for tickets table
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;

-- Optionally disable for other tables too
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;

-- Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'tickets', 'comments', 'categories', 'statuses');

-- Show current policies (for reference)
SELECT 
    schemaname,
    tablename, 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public';

SELECT 'RLS DISABLED FOR DEVELOPMENT' as status,
       NOW() as timestamp;
