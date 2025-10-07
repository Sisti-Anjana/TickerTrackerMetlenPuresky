-- =============================================================================
-- DATABASE CLEANUP SCRIPT
-- Remove any dummy/test data and ensure clean real data
-- =============================================================================

-- First, let's see what data exists
SELECT 'USERS COUNT' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'TICKETS COUNT' as table_name, COUNT(*) as count FROM tickets
UNION ALL
SELECT 'CATEGORIES COUNT' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'STATUSES COUNT' as table_name, COUNT(*) as count FROM statuses;

-- Show sample data to identify dummy entries
SELECT 'SAMPLE USERS' as data_type, 
       id, name, email, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 5;

SELECT 'SAMPLE TICKETS' as data_type,
       id, ticket_number, customer_name, equipment, category,
       ticket_status, created_at
FROM tickets 
ORDER BY created_at DESC 
LIMIT 5;

-- =============================================================================
-- CLEANUP OPERATIONS (RUN ONLY IF YOU WANT TO REMOVE TEST DATA)
-- =============================================================================

-- UNCOMMENT THE SECTIONS BELOW IF YOU WANT TO REMOVE SPECIFIC TEST DATA

-- Remove test users (example - adjust the conditions as needed)
-- DELETE FROM users WHERE email LIKE '%test%' OR email LIKE '%dummy%' OR name LIKE '%test%';

-- Remove test tickets (example - adjust the conditions as needed)  
-- DELETE FROM tickets WHERE customer_name LIKE '%test%' OR customer_name LIKE '%dummy%';

-- Reset ticket numbering if needed (this will update the sequence)
-- SELECT setval(pg_get_serial_sequence('tickets', 'id'), COALESCE(MAX(id), 1)) FROM tickets;

-- =============================================================================
-- ENSURE PROPER CATEGORIES AND STATUSES
-- =============================================================================

-- Ensure we have the correct categories
INSERT INTO categories (name) VALUES 
    ('Production Impacting'),
    ('Communication Issues'),
    ('Cannot Confirm Production')
ON CONFLICT (name) DO NOTHING;

-- Ensure we have the correct statuses
INSERT INTO statuses (name) VALUES 
    ('Open'),
    ('Closed'),
    ('Pending')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- VERIFY DATA INTEGRITY
-- =============================================================================

-- Check for tickets without valid users
SELECT 'ORPHANED TICKETS' as issue, 
       COUNT(*) as count 
FROM tickets t 
LEFT JOIN users u ON t.user_id = u.id 
WHERE u.id IS NULL;

-- Check for invalid categories in tickets
SELECT 'INVALID CATEGORIES' as issue,
       COUNT(*) as count,
       STRING_AGG(DISTINCT category, ', ') as invalid_categories
FROM tickets 
WHERE category NOT IN ('Production Impacting', 'Communication Issues', 'Cannot Confirm Production');

-- Check for invalid statuses in tickets
SELECT 'INVALID STATUSES' as issue,
       COUNT(*) as count,
       STRING_AGG(DISTINCT ticket_status, ', ') as invalid_statuses
FROM tickets 
WHERE ticket_status NOT IN ('Open', 'Closed', 'Pending');

-- =============================================================================
-- FINAL STATUS REPORT
-- =============================================================================

-- Show final counts after cleanup
SELECT 'FINAL COUNTS' as report_type;

SELECT 'USERS' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'TICKETS' as table_name, COUNT(*) as count FROM tickets
UNION ALL
SELECT 'CATEGORIES' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'STATUSES' as table_name, COUNT(*) as count FROM statuses;

-- Show most recent tickets to verify real data
SELECT 'RECENT TICKETS' as report_type,
       ticket_number, 
       customer_name, 
       equipment, 
       category, 
       ticket_status, 
       created_at
FROM tickets 
ORDER BY created_at DESC 
LIMIT 10;
