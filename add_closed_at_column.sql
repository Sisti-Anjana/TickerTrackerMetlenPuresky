-- Migration: Add closed_at column to tickets table
-- This allows tracking when tickets are closed or resolved

-- Add the closed_at column
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP WITH TIME ZONE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_tickets_closed_at ON tickets(closed_at);

-- Add a comment explaining the column
COMMENT ON COLUMN tickets.closed_at IS 'Timestamp when ticket was closed or resolved';

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'tickets' 
AND column_name = 'closed_at';

-- Success message
SELECT '✅ Column closed_at added successfully to tickets table!' AS status;
