-- =============================================================================
-- ADD CLOSED_AT FIELD TO TICKETS TABLE
-- =============================================================================
-- This adds the closed_at timestamp field that the frontend expects
-- Run this after your main schema setup
-- =============================================================================

-- Add the closed_at column to track when tickets are closed
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP WITH TIME ZONE;

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_tickets_closed_at ON tickets(closed_at);

-- =============================================================================
-- UPDATE EXISTING CLOSED TICKETS WITH CLOSED_AT TIMESTAMP
-- =============================================================================
-- For any existing closed tickets, set closed_at to their updated_at time
UPDATE tickets 
SET closed_at = updated_at 
WHERE ticket_status = 'Closed' AND closed_at IS NULL;

-- =============================================================================
-- CREATE TRIGGER TO AUTO-SET CLOSED_AT WHEN STATUS CHANGES TO CLOSED
-- =============================================================================

CREATE OR REPLACE FUNCTION set_closed_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    -- When status changes to 'Closed', set closed_at to current time
    IF NEW.ticket_status = 'Closed' AND OLD.ticket_status != 'Closed' THEN
        NEW.closed_at = NOW();
    END IF;
    
    -- If status changes from 'Closed' to something else, clear closed_at
    IF NEW.ticket_status != 'Closed' AND OLD.ticket_status = 'Closed' THEN
        NEW.closed_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto-setting closed_at
DROP TRIGGER IF EXISTS set_closed_at_trigger ON tickets;
CREATE TRIGGER set_closed_at_trigger
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    WHEN (OLD.ticket_status IS DISTINCT FROM NEW.ticket_status)
    EXECUTE FUNCTION set_closed_at_timestamp();

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $$
DECLARE
    column_exists BOOLEAN;
    trigger_exists BOOLEAN;
BEGIN
    -- Check if column exists
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'tickets' 
        AND column_name = 'closed_at'
    ) INTO column_exists;
    
    -- Check if trigger exists
    SELECT EXISTS (
        SELECT 1 
        FROM pg_trigger 
        WHERE tgname = 'set_closed_at_trigger'
    ) INTO trigger_exists;
    
    -- Report results
    RAISE NOTICE '=== CLOSED_AT FIELD SETUP ===';
    IF column_exists THEN
        RAISE NOTICE '✅ closed_at column added successfully';
    ELSE
        RAISE NOTICE '❌ closed_at column NOT added';
    END IF;
    
    IF trigger_exists THEN
        RAISE NOTICE '✅ Auto-set closed_at trigger created';
    ELSE
        RAISE NOTICE '❌ Trigger NOT created';
    END IF;
    
    IF column_exists AND trigger_exists THEN
        RAISE NOTICE '🎉 SUCCESS! Tickets will now track closed dates';
    END IF;
END $$;

-- Display final confirmation
SELECT 
    '✅ CLOSED_AT FIELD ADDED!' as status,
    COUNT(*) as existing_closed_tickets,
    COUNT(closed_at) as tickets_with_closed_date
FROM tickets 
WHERE ticket_status = 'Closed';
