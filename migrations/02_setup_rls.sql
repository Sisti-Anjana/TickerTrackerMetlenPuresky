-- Row Level Security (RLS) setup for Supabase
-- Run this in your Supabase SQL editor after creating tables

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE statuses ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

-- Users can update their own data
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Anyone can create a user (for registration)
CREATE POLICY "Anyone can create user" ON users
    FOR INSERT WITH CHECK (true);

-- Users can view all tickets (adjust based on your requirements)
CREATE POLICY "Users can view all tickets" ON tickets
    FOR SELECT USING (true);

-- Users can create tickets
CREATE POLICY "Users can create tickets" ON tickets
    FOR INSERT WITH CHECK (true);

-- Users can update tickets they created
CREATE POLICY "Users can update own tickets" ON tickets
    FOR UPDATE USING (user_id::text = auth.uid()::text);

-- Users can view all comments
CREATE POLICY "Users can view all comments" ON tickets
    FOR SELECT USING (true);

-- Users can create comments
CREATE POLICY "Users can create comments" ON comments
    FOR INSERT WITH CHECK (true);

-- Users can update their own comments
CREATE POLICY "Users can update own comments" ON comments
    FOR UPDATE USING (author_id::text = auth.uid()::text);

-- Categories and statuses are readable by all
CREATE POLICY "Anyone can view categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view statuses" ON statuses
    FOR SELECT USING (true);
