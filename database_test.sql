-- =================================================================
-- COMPREHENSIVE DATABASE TESTING AND REPAIR SCRIPT
-- =================================================================
-- This script will:
-- 1. Test database connectivity
-- 2. Verify all tables exist and have correct structure
-- 3. Check for any data integrity issues
-- 4. Repair any problems found
-- 5. Insert test data if needed
-- =================================================================

-- Test 1: Check if all required tables exist
DO $$
DECLARE
    table_count INTEGER;
    missing_tables TEXT[] := ARRAY[]::TEXT[];
BEGIN
    RAISE NOTICE '=== TESTING DATABASE STRUCTURE ===';
    
    -- Check each required table
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'users';
    IF table_count = 0 THEN
        missing_tables := array_append(missing_tables, 'users');
    END IF;

    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'categories';
    IF table_count = 0 THEN
        missing_tables := array_append(missing_tables, 'categories');
    END IF;

    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'statuses';
    IF table_count = 0 THEN
        missing_tables := array_append(missing_tables, 'statuses');
    END IF;

    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'tickets';
    IF table_count = 0 THEN
        missing_tables := array_append(missing_tables, 'tickets');
    END IF;

    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'comments';
    IF table_count = 0 THEN
        missing_tables := array_append(missing_tables, 'comments');
    END IF;

    IF array_length(missing_tables, 1) > 0 THEN
        RAISE NOTICE '❌ MISSING TABLES: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE '✅ ALL REQUIRED TABLES EXIST';
    END IF;
END $$;

-- Test 2: Verify table structures have all required columns
DO $$
DECLARE
    column_count INTEGER;
    missing_columns TEXT[] := ARRAY[]::TEXT[];
BEGIN
    RAISE NOTICE '=== TESTING TABLE STRUCTURES ===';
    
    -- Test tickets table structure
    SELECT COUNT(*) INTO column_count 
    FROM information_schema.columns 
    WHERE table_name = 'tickets' AND column_name IN (
        'id', 'ticket_number', 'user_id', 'customer_name', 'customer_type',
        'asset_name', 'site_name', 'equipment', 'category', 'site_outage',
        'ticket_status', 'issue_start_time', 'issue_end_time', 'kw_down',
        'case_number', 'issue_description', 'additional_notes', 'created_at'
    );
    
    IF column_count < 18 THEN
        RAISE NOTICE '❌ TICKETS TABLE MISSING COLUMNS (found % of 18)', column_count;
    ELSE
        RAISE NOTICE '✅ TICKETS TABLE STRUCTURE COMPLETE';
    END IF;
    
    -- Test users table structure
    SELECT COUNT(*) INTO column_count 
    FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name IN ('id', 'name', 'email', 'password', 'created_at');
    
    IF column_count < 5 THEN
        RAISE NOTICE '❌ USERS TABLE MISSING COLUMNS (found % of 5)', column_count;
    ELSE
        RAISE NOTICE '✅ USERS TABLE STRUCTURE COMPLETE';
    END IF;
END $$;

-- Test 3: Check data integrity
DO $$
DECLARE
    category_count INTEGER;
    status_count INTEGER;
    user_count INTEGER;
    ticket_count INTEGER;
BEGIN
    RAISE NOTICE '=== TESTING DATA INTEGRITY ===';
    
    -- Check categories
    SELECT COUNT(*) INTO category_count FROM categories;
    RAISE NOTICE 'Categories in database: %', category_count;
    
    -- Check statuses
    SELECT COUNT(*) INTO status_count FROM statuses;
    RAISE NOTICE 'Statuses in database: %', status_count;
    
    -- Check users
    SELECT COUNT(*) INTO user_count FROM users;
    RAISE NOTICE 'Users in database: %', user_count;
    
    -- Check tickets
    SELECT COUNT(*) INTO ticket_count FROM tickets;
    RAISE NOTICE 'Tickets in database: %', ticket_count;
    
    IF category_count = 0 THEN
        RAISE NOTICE '⚠️  NO CATEGORIES FOUND - WILL INSERT DEFAULT CATEGORIES';
    END IF;
    
    IF status_count = 0 THEN
        RAISE NOTICE '⚠️  NO STATUSES FOUND - WILL INSERT DEFAULT STATUSES';
    END IF;
END $$;

-- Repair 1: Ensure categories exist
INSERT INTO categories (name) VALUES
    ('Production Impacting'),
    ('Communication Issues'),
    ('Cannot Confirm Production')
ON CONFLICT (name) DO NOTHING;

-- Repair 2: Ensure statuses exist
INSERT INTO statuses (name) VALUES
    ('Open'),
    ('Closed'),
    ('Pending')
ON CONFLICT (name) DO NOTHING;

-- Test 4: Verify functions and triggers exist
DO $$
DECLARE
    function_count INTEGER;
    trigger_count INTEGER;
BEGIN
    RAISE NOTICE '=== TESTING FUNCTIONS AND TRIGGERS ===';
    
    -- Check functions
    SELECT COUNT(*) INTO function_count 
    FROM pg_proc 
    WHERE proname IN ('generate_ticket_number', 'calculate_duration', 'update_updated_at_column');
    
    RAISE NOTICE 'Functions found: %', function_count;
    
    -- Check triggers
    SELECT COUNT(*) INTO trigger_count 
    FROM pg_trigger 
    WHERE tgname IN ('generate_ticket_number_trigger', 'calculate_duration_trigger', 'update_tickets_updated_at');
    
    RAISE NOTICE 'Triggers found: %', trigger_count;
    
    IF function_count < 3 THEN
        RAISE NOTICE '⚠️  MISSING FUNCTIONS - PLEASE RUN FULL SCHEMA SETUP';
    END IF;
    
    IF trigger_count < 3 THEN
        RAISE NOTICE '⚠️  MISSING TRIGGERS - PLEASE RUN FULL SCHEMA SETUP';
    END IF;
END $$;

-- Test 5: Test ticket creation functionality
DO $$
DECLARE
    test_user_id INTEGER;
    test_ticket_id INTEGER;
    test_ticket_number VARCHAR;
BEGIN
    RAISE NOTICE '=== TESTING TICKET CREATION ===';
    
    -- Check if we have at least one user for testing
    SELECT id INTO test_user_id FROM users LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RAISE NOTICE '⚠️  NO USERS FOUND - CANNOT TEST TICKET CREATION';
        RAISE NOTICE 'Please register a user first through the application';
    ELSE
        RAISE NOTICE '✅ TEST USER FOUND (ID: %)', test_user_id;
        
        -- Try to create a test ticket (will be deleted immediately)
        INSERT INTO tickets (
            user_id, customer_name, customer_type, site_name, equipment, 
            category, site_outage, ticket_status, issue_start_time, 
            issue_end_time, issue_description
        ) VALUES (
            test_user_id, 'Test Customer', 'Puresky', 'Test Site', 'Production Meter',
            'Production Impacting', 'No', 'Open', NOW() - INTERVAL '1 hour',
            NOW(), 'Database connectivity test ticket'
        ) RETURNING id, ticket_number INTO test_ticket_id, test_ticket_number;
        
        IF test_ticket_id IS NOT NULL THEN
            RAISE NOTICE '✅ TEST TICKET CREATED SUCCESSFULLY (%, %)', test_ticket_id, test_ticket_number;
            
            -- Clean up test ticket
            DELETE FROM tickets WHERE id = test_ticket_id;
            RAISE NOTICE '✅ TEST TICKET CLEANED UP';
        ELSE
            RAISE NOTICE '❌ FAILED TO CREATE TEST TICKET';
        END IF;
    END IF;
END $$;

-- Final Summary
DO $$
DECLARE
    total_tables INTEGER;
    total_categories INTEGER;
    total_statuses INTEGER;
    total_users INTEGER;
    total_tickets INTEGER;
BEGIN
    RAISE NOTICE '=== DATABASE TEST SUMMARY ===';
    
    SELECT COUNT(*) INTO total_tables 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name IN ('users', 'categories', 'statuses', 'tickets', 'comments');
    
    SELECT COUNT(*) INTO total_categories FROM categories;
    SELECT COUNT(*) INTO total_statuses FROM statuses;
    SELECT COUNT(*) INTO total_users FROM users;
    SELECT COUNT(*) INTO total_tickets FROM tickets;
    
    RAISE NOTICE 'Tables: % of 5 required', total_tables;
    RAISE NOTICE 'Categories: %', total_categories;
    RAISE NOTICE 'Statuses: %', total_statuses;
    RAISE NOTICE 'Users: %', total_users;
    RAISE NOTICE 'Tickets: %', total_tickets;
    
    IF total_tables = 5 AND total_categories >= 3 AND total_statuses >= 3 THEN
        RAISE NOTICE '🎉 DATABASE IS READY FOR USE!';
        RAISE NOTICE 'You can now:';
        RAISE NOTICE '  1. Register/login users';
        RAISE NOTICE '  2. Create tickets';
        RAISE NOTICE '  3. View dashboard';
    ELSE
        RAISE NOTICE '⚠️  DATABASE NEEDS ATTENTION';
        RAISE NOTICE 'Please run the full database_schema.sql script';
    END IF;
END $$;

-- Show current data for verification
SELECT '=== CATEGORIES ===' as info;
SELECT id, name FROM categories ORDER BY id;

SELECT '=== STATUSES ===' as info;
SELECT id, name FROM statuses ORDER BY id;

SELECT '=== USERS ===' as info;
SELECT id, name, email, created_at FROM users ORDER BY created_at DESC LIMIT 5;

SELECT '=== RECENT TICKETS ===' as info;
SELECT 
    id, 
    ticket_number, 
    customer_name, 
    equipment, 
    category, 
    ticket_status,
    created_at 
FROM tickets 
ORDER BY created_at DESC 
LIMIT 10;