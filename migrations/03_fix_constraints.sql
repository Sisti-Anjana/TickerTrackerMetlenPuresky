-- Fix database constraints that are too restrictive
-- Run this in your Supabase SQL Editor

-- Drop any existing check constraints on tickets table
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_company_check;
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_site_check;
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_equipment_check;
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_outage_check;
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_case_number_check;

-- Make sure all text fields allow reasonable lengths
ALTER TABLE tickets ALTER COLUMN company TYPE VARCHAR(500);
ALTER TABLE tickets ALTER COLUMN site TYPE VARCHAR(500);
ALTER TABLE tickets ALTER COLUMN equipment TYPE VARCHAR(500);
ALTER TABLE tickets ALTER COLUMN outage TYPE VARCHAR(500);
ALTER TABLE tickets ALTER COLUMN case_number TYPE VARCHAR(500);

-- Update the ticket_number to allow longer values if needed
ALTER TABLE tickets ALTER COLUMN ticket_number TYPE VARCHAR(50);
