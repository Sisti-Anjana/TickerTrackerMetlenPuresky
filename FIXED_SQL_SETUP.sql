-- ============================================
-- CORRECT SQL FOR TICKET TRACKER - RUN THIS
-- ============================================

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Create statuses table  
CREATE TABLE IF NOT EXISTS statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Create tickets table with your exact fields
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    ticket_number VARCHAR(255) UNIQUE,
    user_id INTEGER REFERENCES users(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_type VARCHAR(50) NOT NULL,
    asset_name VARCHAR(255),
    site_name VARCHAR(100) NOT NULL,
    equipment VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    site_outage VARCHAR(50) NOT NULL,
    ticket_status VARCHAR(50) DEFAULT 'Open',
    status_id INTEGER REFERENCES statuses(id),
    issue_start_time TIMESTAMP WITH TIME ZONE,
    issue_end_time TIMESTAMP WITH TIME ZONE,
    total_duration VARCHAR(100),
    kw_down DECIMAL(10,2),
    case_number VARCHAR(255),
    issue_description TEXT NOT NULL,
    additional_notes TEXT,
    priority VARCHAR(50) DEFAULT 'Medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert categories
INSERT INTO categories (name) VALUES 
    ('Production Impacting'),
    ('Communication Issues'), 
    ('Cannot Confirm Production')
ON CONFLICT (name) DO NOTHING;

-- Insert statuses
INSERT INTO statuses (name) VALUES 
    ('Open'),
    ('Closed'),
    ('Pending')
ON CONFLICT (name) DO NOTHING;

-- Function to generate AGS ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ticket_number IS NULL THEN
        SELECT 'AGS' || COALESCE(
            (SELECT MAX(CAST(SUBSTRING(ticket_number FROM 4) AS INTEGER)) + 1 
             FROM tickets WHERE ticket_number ~ '^AGS[0-9]+$'), 1
        ) INTO NEW.ticket_number;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for ticket number generation
DROP TRIGGER IF EXISTS generate_ticket_number_trigger ON tickets;
CREATE TRIGGER generate_ticket_number_trigger
    BEFORE INSERT ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION generate_ticket_number();

-- Function to calculate duration
CREATE OR REPLACE FUNCTION calculate_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.issue_start_time IS NOT NULL AND NEW.issue_end_time IS NOT NULL THEN
        SELECT 
            EXTRACT(EPOCH FROM (NEW.issue_end_time - NEW.issue_start_time)) / 3600 || 'h'
        INTO NEW.total_duration;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for duration calculation
DROP TRIGGER IF EXISTS calculate_duration_trigger ON tickets;
CREATE TRIGGER calculate_duration_trigger
    BEFORE INSERT OR UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION calculate_duration();

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database setup completed successfully!';
    RAISE NOTICE 'You can now create tickets with AGS numbers!';
END $$;