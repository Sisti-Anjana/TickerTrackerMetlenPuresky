-- Add title field to tickets table
-- Run this in your Supabase SQL Editor

-- Add title column to tickets table
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS title VARCHAR(255);

-- Update existing tickets to have a title based on description
UPDATE tickets 
SET title = CASE 
    WHEN LENGTH(description) > 50 THEN LEFT(description, 50) || '...'
    ELSE description
END
WHERE title IS NULL OR title = '';

-- Make title field required for new tickets
ALTER TABLE tickets ALTER COLUMN title SET NOT NULL;
