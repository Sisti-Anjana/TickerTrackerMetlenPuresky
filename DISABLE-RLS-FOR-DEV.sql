-- QUICK FIX: Disable RLS on all tables for development
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/tlnojwnrvvrnujnhdlrr/sql

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, 
       CASE WHEN rowsecurity = false THEN '❌ Disabled' 
            ELSE '✅ Enabled' 
       END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'tickets', 'comments', 'categories');
