-- ========================================
-- COPY AND PASTE THIS INTO SUPABASE SQL EDITOR
-- https://supabase.com/dashboard/project/tlnojwnrvvrnujnhdlrr/sql
-- ========================================

-- Step 1: Disable Row Level Security (so backend can read users)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;

-- Step 2: Create admin user (password: admin123)
INSERT INTO users (name, email, password, role, must_change_password, created_at, updated_at)
VALUES (
  'System Administrator',
  'admin@system.local',
  '$2a$10$rB7VWFJWZZfO9X8YrGBiJOKr7UQT.L2ZJ4LxY0hLZvZLHKY8LZ0UG',
  'admin',
  false,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password = '$2a$10$rB7VWFJWZZfO9X8YrGBiJOKr7UQT.L2ZJ4LxY0hLZvZLHKY8LZ0UG',
  role = 'admin',
  must_change_password = false;

-- Step 3: Verify it worked
SELECT id, name, email, role FROM users WHERE role = 'admin';

-- ========================================
-- After running this, you can login with:
-- Email: admin@system.local
-- Password: admin123
-- ========================================
