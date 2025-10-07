-- Migration to add new fields for the UI requirements
-- This adds customer_type, subject, and priority fields to support the new UI

-- Add new columns to tickets table
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS customer_type VARCHAR(255),
ADD COLUMN IF NOT EXISTS subject VARCHAR(500),
ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'Medium';

-- Update existing records with default values
UPDATE tickets 
SET 
    customer_type = 'Puresky' 
WHERE customer_type IS NULL;

UPDATE tickets 
SET 
    subject = COALESCE(description, 'Untitled Ticket')
WHERE subject IS NULL;

UPDATE tickets 
SET 
    priority = 'Medium' 
WHERE priority IS NULL;

-- Update categories to match UI requirements
INSERT INTO categories (name) VALUES 
    ('General'),
    ('Technical'),
    ('Maintenance'),
    ('Emergency')
ON CONFLICT DO NOTHING;

-- Create index for new fields
CREATE INDEX IF NOT EXISTS idx_tickets_customer_type ON tickets(customer_type);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_subject ON tickets USING gin(to_tsvector('english', subject));_updated_at ON tickets;
CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
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

-- Create full-text search index for searching tickets
CREATE INDEX IF NOT EXISTS idx_tickets_search ON tickets 
USING gin(to_tsvector('english', 
    COALESCE(ticket_number, '') || ' ' || 
    COALESCE(customer_name, '') || ' ' || 
    COALESCE(equipment, '') || ' ' || 
    COALESCE(category, '') || ' ' || 
    COALESCE(issue_description, '')
));

-- Insert sample data for testing (optional)
-- Uncomment if you want some test data

/*
-- Sample user (password should be hashed in real application)
INSERT INTO users (name, email, password) VALUES 
    ('John Doe', 'john@example.com', '$2b$10$sample_hashed_password')
ON CONFLICT DO NOTHING;

-- Sample tickets
INSERT INTO tickets (
    user_id, customer_name, customer_type, asset_name, site_name, 
    equipment, category, category_id, site_outage, ticket_status, status_id,
    issue_start_time, issue_end_time, kw_down, case_number,
    issue_description, additional_notes
) VALUES 
    (
        1, 'John Doe', 'Puresky', 'Asset 1', 'Site 1', 
        'Production Meter', 'Production Impacting', 1, 'Yes', 'Open', 1,
        '2024-01-15 09:00:00+00', '2024-01-15 17:00:00+00', 150.75, 'CASE001',
        'Production meter showing incorrect readings after maintenance',
        'Requires immediate attention due to production impact'
    ),
    (
        1, 'John Doe', 'Metlon', 'Asset 2', 'Site 2',
        'Inverter', 'Communication Issues', 2, 'No', 'Open', 1, 
        '2024-01-16 10:30:00+00', '2024-01-16 14:30:00+00', 75.25, 'CASE002',
        'Inverter communication lost, unable to monitor performance',
        'Check network connectivity and communication protocols'
    )
ON CONFLICT DO NOTHING;
*/

-- Views for easier data retrieval

-- View for tickets with all related information
CREATE OR REPLACE VIEW ticket_details AS
SELECT 
    t.id,
    t.ticket_number,
    t.customer_name,
    t.customer_type,
    t.asset_name,
    t.site_name,
    t.equipment,
    t.category,
    t.site_outage,
    t.ticket_status,
    t.issue_start_time,
    t.issue_end_time,
    t.total_duration,
    t.kw_down,
    t.case_number,
    t.issue_description,
    t.additional_notes,
    t.created_at,
    t.updated_at,
    u.name as created_by_name,
    u.email as created_by_email,
    c.name as category_name,
    s.name as status_name
FROM tickets t
LEFT JOIN users u ON t.user_id = u.id  
LEFT JOIN categories c ON t.category_id = c.id
LEFT JOIN statuses s ON t.status_id = s.id;

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

-- Function to search tickets (for dashboard search functionality)
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

-- Grant necessary permissions (adjust according to your user setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

COMMENT ON TABLE tickets IS 'Main tickets table with all form fields from create ticket page';
COMMENT ON COLUMN tickets.ticket_number IS 'Auto-generated unique ticket number (AGS1, AGS2, etc.)';
COMMENT ON COLUMN tickets.customer_name IS 'Defaults to logged-in user name';  
COMMENT ON COLUMN tickets.customer_type IS 'Either Puresky or Metlon';
COMMENT ON COLUMN tickets.site_name IS 'Site 1 or Site 2';
COMMENT ON COLUMN tickets.equipment IS 'One of 5 equipment options';
COMMENT ON COLUMN tickets.category IS 'One of 3 category options';
COMMENT ON COLUMN tickets.site_outage IS 'Yes, No, or TBD (To be decided)';
COMMENT ON COLUMN tickets.ticket_status IS 'Open (default), Closed, or Pending';
COMMENT ON COLUMN tickets.total_duration IS 'Auto-calculated from start and end times';
COMMENT ON COLUMN tickets.kw_down IS 'Manually entered KW value';
COMMENT ON COLUMN tickets.case_number IS 'Manually entered case reference';
COMMENT ON COLUMN tickets.issue_description IS 'Required detailed description';
COMMENT ON COLUMN tickets.additional_notes IS 'Optional additional information';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database schema created successfully!';
    RAISE NOTICE 'Tables created: users, categories, statuses, tickets, comments';
    RAISE NOTICE 'Auto-generation: ticket_number (AGS1, AGS2, etc.) and total_duration';
    RAISE NOTICE 'Views created: ticket_details, dashboard_stats';
    RAISE NOTICE 'Search function: search_tickets(search_term, limit)';
    RAISE NOTICE 'Ready for ticket creation with your exact form fields!';
END $$;