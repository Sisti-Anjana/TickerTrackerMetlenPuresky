-- Add status column to client_types and sites tables if they don't exist
-- Run this in your Supabase SQL Editor

-- Add status column to client_types if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'client_types' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE client_types 
        ADD COLUMN status VARCHAR(20) DEFAULT 'active' 
        CHECK (status IN ('active', 'inactive'));
        
        -- Update existing rows to have 'active' status
        UPDATE client_types SET status = 'active' WHERE status IS NULL;
        
        RAISE NOTICE 'Added status column to client_types table';
    ELSE
        RAISE NOTICE 'status column already exists in client_types table';
    END IF;
END $$;

-- Add status column to sites if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'sites' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE sites 
        ADD COLUMN status VARCHAR(20) DEFAULT 'active' 
        CHECK (status IN ('active', 'inactive'));
        
        -- Update existing rows to have 'active' status
        UPDATE sites SET status = 'active' WHERE status IS NULL;
        
        RAISE NOTICE 'Added status column to sites table';
    ELSE
        RAISE NOTICE 'status column already exists in sites table';
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_client_types_status ON client_types(status);
CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status);

-- Verify the columns exist
SELECT 
    table_name,
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name IN ('client_types', 'sites')
AND column_name = 'status'
ORDER BY table_name;

