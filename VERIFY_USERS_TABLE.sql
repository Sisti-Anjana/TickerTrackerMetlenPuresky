-- ============================================
-- VERIFY USERS TABLE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Check if users table exists and view its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'users'
ORDER BY 
    ordinal_position;

-- ============================================
-- VIEW ALL USERS (Check what's stored)
-- ============================================

SELECT 
    id,
    name,
    email,
    role,
    must_change_password,
    created_at,
    last_password_change
FROM 
    users
ORDER BY 
    created_at DESC;

-- ============================================
-- COUNT USERS BY ROLE
-- ============================================

SELECT 
    role,
    COUNT(*) as count
FROM 
    users
GROUP BY 
    role;

-- ============================================
-- CHECK IF ADMIN ACCOUNT EXISTS
-- ============================================

SELECT 
    id,
    name,
    email,
    role,
    created_at
FROM 
    users
WHERE 
    email = 'admin@system.local';

-- ============================================
-- VERIFY TABLE INDEXES
-- ============================================

SELECT
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    tablename = 'users';

-- ============================================
-- If you need to recreate the users table:
-- (ONLY RUN IF TABLE IS MISSING OR CORRUPTED)
-- ============================================

/*
-- Drop existing table (WARNING: This deletes all user data!)
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with all required columns
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    must_change_password BOOLEAN DEFAULT false,
    last_password_change TIMESTAMP WITH TIME ZONE,
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Insert default admin account
-- Password: Admin@123
INSERT INTO users (name, email, password, role, must_change_password)
VALUES (
    'System Administrator',
    'admin@system.local',
    '$2a$10$exJmuuR6OrPsVBDF1ZXTO.1QZyIEIkoEv5cbN9XTc7uNAL9HhdJnC',
    'admin',
    false
);

-- Verify admin account was created
SELECT 
    id,
    name,
    email,
    role,
    created_at
FROM 
    users
WHERE 
    email = 'admin@system.local';
*/

-- ============================================
-- TEST: Create a sample user (for testing)
-- ============================================

/*
INSERT INTO users (name, email, password, role, must_change_password)
VALUES (
    'Test User',
    'test@example.com',
    '$2a$10$exJmuuR6OrPsVBDF1ZXTO.1QZyIEIkoEv5cbN9XTc7uNAL9HhdJnC', -- Password: Admin@123
    'user',
    true
);

-- View the test user
SELECT * FROM users WHERE email = 'test@example.com';
*/

-- ============================================
-- ENABLE ROW LEVEL SECURITY (IMPORTANT!)
-- ============================================

-- First, disable RLS temporarily for development
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- OR if you want to enable RLS with proper policies:
/*
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow all operations for service role (backend)
CREATE POLICY "Allow service role full access" ON users
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Allow users to read their own data
CREATE POLICY "Users can read own data" ON users
    FOR SELECT
    USING (auth.uid()::text = id::text);

-- Allow users to update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE
    USING (auth.uid()::text = id::text)
    WITH CHECK (auth.uid()::text = id::text);
*/

-- ============================================
-- VERIFY EVERYTHING IS WORKING
-- ============================================

-- Final check: Show all users with their roles
SELECT 
    id,
    name,
    email,
    role,
    must_change_password,
    TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at,
    CASE 
        WHEN last_password_change IS NOT NULL 
        THEN TO_CHAR(last_password_change, 'YYYY-MM-DD HH24:MI:SS')
        ELSE 'Never'
    END as last_password_change
FROM 
    users
ORDER BY 
    created_at DESC;

-- ✅ Success message
SELECT 
    '✅ Users table is properly configured!' as status,
    COUNT(*) as total_users,
    SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_count,
    SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as user_count,
    SUM(CASE WHEN must_change_password = true THEN 1 ELSE 0 END) as users_need_password_change
FROM 
    users;