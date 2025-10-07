-- Migration to add closed_at field to tickets table
-- This field will store when a ticket was resolved/closed by the user

ALTER TABLE tickets ADD COLUMN closed_at TIMESTAMP WITH TIME ZONE;

-- Add comment to document the field
COMMENT ON COLUMN tickets.closed_at IS 'Timestamp when the ticket was marked as resolved/closed by the user';

-- Create index for performance when filtering by closed tickets
CREATE INDEX idx_tickets_closed_at ON tickets(closed_at) WHERE closed_at IS NOT NULL;

-- Update any existing closed tickets to have a closed_at date
-- (using the issue_end_time or updated_at as fallback)
UPDATE tickets 
SET closed_at = COALESCE(issue_end_time, updated_at)
WHERE ticket_status = 'Closed' AND closed_at IS NULL;
