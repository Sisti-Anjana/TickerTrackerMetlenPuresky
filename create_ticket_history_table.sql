-- Create ticket_history table for audit logging
CREATE TABLE IF NOT EXISTS ticket_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id BIGINT REFERENCES tickets(id) ON DELETE CASCADE,
  changed_by BIGINT REFERENCES users(id),
  changes JSONB NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for ticket_history
ALTER TABLE ticket_history ENABLE ROW LEVEL SECURITY;

-- Allow users to view history of tickets they can see (simplified for now: authenticated users)
CREATE POLICY "Authenticated users can view ticket history" 
ON ticket_history FOR SELECT 
TO authenticated 
USING (true);

-- Allow system/backend to insert history (authenticated users implicitly via API)
CREATE POLICY "Authenticated users can insert ticket history" 
ON ticket_history FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Grant permissions (if needed, though authenticated usually covers it)
GRANT ALL ON ticket_history TO authenticated;
GRANT ALL ON ticket_history TO service_role;
