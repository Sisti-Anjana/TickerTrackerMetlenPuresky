-- Add "Resolved" status to the statuses table
INSERT INTO statuses (name) VALUES ('Resolved')
ON CONFLICT (name) DO NOTHING;

-- Verify it was added
SELECT * FROM statuses ORDER BY id;
