-- Add description columns to client_types and sites tables
ALTER TABLE client_types ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS description TEXT;

-- Update existing records if needed (optional)
-- UPDATE client_types SET description = 'Default description' WHERE description IS NULL;
-- UPDATE sites SET description = 'Default site description' WHERE description IS NULL;
