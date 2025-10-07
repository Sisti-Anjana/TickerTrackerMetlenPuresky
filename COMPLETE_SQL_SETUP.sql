-- =============================================================================
-- COMPLETE SQL SCHEMA FOR TICKET TRACKER
-- Run this entire script in your Supabase SQL Editor
-- =============================================================================

-- Create users table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table (simplified for your 3 specific categories)
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Create statuses table (for your 3 status options)
CREATE TABLE IF NOT EXISTS statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Create the main tickets table with ALL your required fields
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    ticket_number VARCHAR(255) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Customer Information (from your form)
    customer_name VARCHAR(255) NOT NULL,
    customer_type VARCHAR(50) NOT NULL,
    
    -- Asset and Site Information
    asset_name VARCHAR(255),
    site_name VARCHAR(100) NOT NULL,
    
    -- Equipment and Category (your exact options)
    equipment VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    
    -- Site and Status Information
    site_outage VARCHAR(50) NOT NULL,
    ticket_status VARCHAR(50) NOT NULL DEFAULT 'Open',
    status_id INTEGER REFERENCES statuses(id),
    
    -- Time and Duration
    issue_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    issue_end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    total_duration VARCHAR(100),
    
    -- Additional Information
    kw_down DECIMAL(10,2),
    case_number VARCHAR(255),
    
    -- Description fields
    issue_description TEXT NOT NULL,
    additional_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table (for future use)
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert your specific categories
INSERT INTO categories (name) VALUES 
    ('Production Impacting'),
    ('Communication Issues'),
    ('Cannot Confirm Production')
ON CONFLICT (name) DO NOTHING;

-- Insert your specific statuses
INSERT INTO statuses (name) VALUES 
    ('Open'),
    ('Closed'), 
    ('Pending')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- AUTO-GENERATION FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to auto-generate ticket numbers (AGS1, AGS2, AGS3, etc.)
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate ticket number in format AGS1, AGS2, AGS3, etc.
    SELECT COALESCE(
        'AGS' || (
            SELECT COALESCE(MAX(
                CAST(SUBSTRING(ticket_number FROM 4) AS INTEGER)
            ), 0) + 1
            FROM tickets 
            WHERE ticket_number ~ '^AGS[0-9]+$'
        ), 
        'AGS1'
    ) INTO NEW.ticket_number;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate ticket numbers
DROP TRIGGER IF EXISTS generate_ticket_number_trigger ON tickets;
CREATE TRIGGER generate_ticket_number_trigger
    BEFORE INSERT ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION generate_ticket_number();

-- Function to auto-calculate duration
CREATE OR REPLACE FUNCTION calculate_duration()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate total duration between start and end time
    IF NEW.issue_start_time IS NOT NULL AND NEW.issue_end_time IS NOT NULL THEN
        SELECT 
            CASE 
                WHEN EXTRACT(EPOCH FROM (NEW.issue_end_time - NEW.issue_start_time)) > 0 THEN
                    FLOOR(EXTRACT(EPOCH FROM (NEW.issue_end_time - NEW.issue_start_time)) / 3600) || 'h ' ||
                    FLOOR((EXTRACT(EPOCH FROM (NEW.issue_end_time - NEW.issue_start_time)) % 3600) / 60) || 'm'
                ELSE 
                    '0h 0m'
            END
        INTO NEW.total_duration;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate duration
DROP TRIGGER IF EXISTS calculate_duration_trigger ON tickets;
CREATE TRIGGER calculate_duration_trigger
    BEFORE INSERT OR UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION calculate_duration();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS update_tickets_updated_at ON tickets;
CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- PERFORMANCE INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_category_id ON tickets(category_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status_id ON tickets(status_id);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_tickets_customer_type ON tickets(customer_type);
CREATE INDEX IF NOT EXISTS idx_tickets_site_name ON tickets(site_name);
CREATE INDEX IF NOT EXISTS idx_tickets_equipment ON tickets(equipment);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_status ON tickets(ticket_status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_ticket_id ON comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Full-text search index for dashboard search
CREATE INDEX IF NOT EXISTS idx_tickets_search ON tickets 
USING gin(to_tsvector('english', 
    COALESCE(ticket_number, '') || ' ' || 
    COALESCE(customer_name, '') || ' ' || 
    COALESCE(equipment, '') || ' ' || 
    COALESCE(category, '') || ' ' || 
    COALESCE(issue_description, '') || ' ' ||
    COALESCE(case_number, '')
));

-- =============================================================================
-- HELPFUL VIEWS AND FUNCTIONS
-- =============================================================================

-- View for dashboard statistics
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    COUNT(*) as total_tickets,
    COUNT(CASE WHEN ticket_status = 'Open' THEN 1 END) as open_tickets,
    COUNT(CASE WHEN ticket_status = 'Closed' THEN 1 END) as closed_tickets,
    COUNT(CASE WHEN ticket_status = 'Pending' THEN 1 END) as pending_tickets,
    COUNT(CASE WHEN category = 'Production Impacting' THEN 1 END) as production_impacting,
    COUNT(CASE WHEN site_outage = 'Yes' THEN 1 END) as site_outages,
    AVG(kw_down) as avg_kw_down,
    COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as tickets_today,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as tickets_this_week
FROM tickets;

-- Function for dashboard search
CREATE OR REPLACE FUNCTION search_tickets(search_term TEXT, limit_count INTEGER DEFAULT 50)
RETURNS TABLE(
    id INTEGER,
    ticket_number VARCHAR,
    customer_name VARCHAR,
    customer_type VARCHAR,
    site_name VARCHAR,
    equipment VARCHAR,
    category VARCHAR,
    ticket_status VARCHAR,
    issue_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    created_by_name VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.ticket_number,
        t.customer_name,
        t.customer_type,
        t.site_name,
        t.equipment,
        t.category,
        t.ticket_status,
        t.issue_description,
        t.created_at,
        u.name as created_by_name
    FROM tickets t
    LEFT JOIN users u ON t.user_id = u.id
    WHERE 
        t.ticket_number ILIKE '%' || search_term || '%' OR
        t.customer_name ILIKE '%' || search_term || '%' OR
        t.equipment ILIKE '%' || search_term || '%' OR
        t.category ILIKE '%' || search_term || '%' OR
        t.issue_description ILIKE '%' || search_term || '%' OR
        t.case_number ILIKE '%' || search_term || '%'
    ORDER BY t.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SUCCESS CONFIRMATION
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Database schema setup completed successfully!';
    RAISE NOTICE '📋 Tables created: users, categories, statuses, tickets, comments';
    RAISE NOTICE '🎯 Auto-generation: ticket numbers (AGS1, AGS2...) and duration calculation';
    RAISE NOTICE '📊 Views created: dashboard_stats for statistics';
    RAISE NOTICE '🔍 Search function: search_tickets() for dashboard search';
    RAISE NOTICE '🚀 Your create ticket form is ready to use!';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 NEXT STEPS:';
    RAISE NOTICE '1. Go to http://localhost:3000';
    RAISE NOTICE '2. Login/Register a user';
    RAISE NOTICE '3. Click "Create New Ticket"';
    RAISE NOTICE '4. Test the complete flow!';
END $$;

-- Check if everything was created successfully
SELECT 'Tables created' as status, count(*) as count 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('users', 'categories', 'statuses', 'tickets', 'comments');

SELECT 'Categories inserted' as status, count(*) as count FROM categories;
SELECT 'Statuses inserted' as status, count(*) as count FROM statuses;