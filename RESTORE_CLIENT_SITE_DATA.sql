-- Restore Client Types and Sites Data
-- Run this script in your Supabase SQL Editor to restore common client types and sites
-- This will restore: Puresky, Metlen, and their associated sites

-- Insert Client Types (based on what was previously in the system)
INSERT INTO client_types (name, status, created_at, updated_at)
VALUES 
  ('Puresky', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Metlen', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Puresky Energy', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Metlen Energy', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Solar Corp', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- Get the IDs of inserted client types for sites
DO $$
DECLARE
  puresky_energy_id INTEGER;
  metlen_energy_id INTEGER;
  solar_corp_id INTEGER;
  puresky_id INTEGER;
BEGIN
  -- Get client type IDs
  SELECT id INTO puresky_id FROM client_types WHERE name = 'Puresky' LIMIT 1;
  SELECT id INTO metlen_id FROM client_types WHERE name = 'Metlen' LIMIT 1;
  SELECT id INTO puresky_energy_id FROM client_types WHERE name = 'Puresky Energy' LIMIT 1;
  SELECT id INTO metlen_energy_id FROM client_types WHERE name = 'Metlen Energy' LIMIT 1;
  SELECT id INTO solar_corp_id FROM client_types WHERE name = 'Solar Corp' LIMIT 1;

  -- Insert Sites for Puresky (main one)
  IF puresky_id IS NOT NULL THEN
    INSERT INTO sites (name, location, client_type_id, status, created_at, updated_at)
    VALUES 
      ('Dover - Buckmaster pond', 'Dover - Buckmaster pond', puresky_id, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Site 1', 'Location 1', puresky_id, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Site 2', 'Location 2', puresky_id, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (name, client_type_id) DO NOTHING;
  END IF;

  -- Insert Sites for Metlen
  IF metlen_id IS NOT NULL THEN
    INSERT INTO sites (name, location, client_type_id, status, created_at, updated_at)
    VALUES 
      ('Metlen Site 1', 'Location A', metlen_id, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Metlen Site 2', 'Location B', metlen_id, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (name, client_type_id) DO NOTHING;
  END IF;

  -- Insert Sites for Puresky Energy
  IF puresky_energy_id IS NOT NULL THEN
    INSERT INTO sites (name, location, client_type_id, status, created_at, updated_at)
    VALUES 
      ('Site 1', 'Dover - Buckmaster pond', puresky_energy_id, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Site 2', 'Location 2', puresky_energy_id, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Site 3', 'Location 3', puresky_energy_id, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (name, client_type_id) DO NOTHING;
  END IF;

  -- Insert Sites for Metlen Energy
  IF metlen_energy_id IS NOT NULL THEN
    INSERT INTO sites (name, location, client_type_id, status, created_at, updated_at)
    VALUES 
      ('Metlen Site 1', 'Location A', metlen_energy_id, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Metlen Site 2', 'Location B', metlen_energy_id, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (name, client_type_id) DO NOTHING;
  END IF;

  -- Insert Sites for Solar Corp
  IF solar_corp_id IS NOT NULL THEN
    INSERT INTO sites (name, location, client_type_id, status, created_at, updated_at)
    VALUES 
      ('Solar Site 1', 'Location X', solar_corp_id, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Solar Site 2', 'Location Y', solar_corp_id, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (name, client_type_id) DO NOTHING;
  END IF;
END $$;

-- Verify the data
SELECT 
  ct.id as client_id,
  ct.name as client_name,
  ct.status as client_status,
  COUNT(s.id) as site_count
FROM client_types ct
LEFT JOIN sites s ON s.client_type_id = ct.id
GROUP BY ct.id, ct.name, ct.status
ORDER BY ct.created_at DESC;

