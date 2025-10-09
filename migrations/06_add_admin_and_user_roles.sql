-- Add role and password change tracking to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP WITH TIME ZONE;

-- Create default admin account
-- Email: admin@system.local
-- Password: Admin@123
INSERT INTO users (name, email, password, role, must_change_password)
VALUES (
    'System Administrator',
    'admin@system.local',
    '$2a$10$exJmuuR6OrPsVBDF1ZXTO.1QZyIEIkoEv5cbN9XTc7uNAL9HhdJnC',
    'admin',
    false
)
ON CONFLICT (email) DO UPDATE SET 
    role = 'admin',
    password = '$2a$10$exJmuuR6OrPsVBDF1ZXTO.1QZyIEIkoEv5cbN9XTc7uNAL9HhdJnC';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Update existing users to have 'user' role
UPDATE users SET role = 'user' WHERE role IS NULL;

SELECT '✅ Admin and user roles added successfully!' AS message
UNION ALL
SELECT '👤 Default admin account: admin@system.local'
UNION ALL
SELECT '🔑 Default admin password: Admin@123'
UNION ALL
SELECT '⚠️  Please change the admin password after first login!';