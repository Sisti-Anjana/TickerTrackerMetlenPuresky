-- Allow NULL values for issue_end_time in tickets table
ALTER TABLE tickets ALTER COLUMN issue_end_time DROP NOT NULL;
