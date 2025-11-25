-- Fix Status Columns for Client Types and Sites Tables
-- Run this in your Supabase SQL Editor to add missing status columns
-- This script is safe to run multiple times - it checks if columns exist first

-- ============================================
-- STEP 1: Add status column to client_types
-- ============================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'client_types' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE client_types 
        ADD COLUMN status VARCHAR(20) DEFAULT 'active';
        
        -- Add check constraint
        ALTER TABLE client_types 
        ADD CONSTRAINT client_types_status_check 
        CHECK (status IN ('active', 'inactive'));
        
        -- Update existing rows to have 'active' status
        UPDATE client_types SET status = 'active' WHERE status IS NULL;
        
        RAISE NOTICE '✅ Added status column to client_types table';
    ELSE
        RAISE NOTICE 'ℹ️ status column already exists in client_types table';
    END IF;
END $$;

-- ============================================
-- STEP 2: Add status column to sites
-- ============================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'sites' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE sites 
        ADD COLUMN status VARCHAR(20) DEFAULT 'active';
        
        -- Add check constraint
        ALTER TABLE sites 
        ADD CONSTRAINT sites_status_check 
        CHECK (status IN ('active', 'inactive'));
        
        -- Update existing rows to have 'active' status
        UPDATE sites SET status = 'active' WHERE status IS NULL;
        
        RAISE NOTICE '✅ Added status column to sites table';
    ELSE
        RAISE NOTICE 'ℹ️ status column already exists in sites table';
    END IF;
END $$;

-- ============================================
-- STEP 3: Create indexes for better performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_client_types_status ON client_types(status);
CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status);

-- ============================================
-- STEP 4: Verify the columns were added
-- ============================================
SELECT 
    'Verification' as step,
    table_name,
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('client_types', 'sites')
AND column_name = 'status'
ORDER BY table_name, column_name;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT '✅ Status columns have been added successfully!' as result;

