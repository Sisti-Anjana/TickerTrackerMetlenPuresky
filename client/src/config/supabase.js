// Supabase Configuration for Client
import { createClient } from '@supabase/supabase-js';

if (!process.env.REACT_APP_SUPABASE_URL) {
  throw new Error('Missing REACT_APP_SUPABASE_URL environment variable');
}
if (!process.env.REACT_APP_SUPABASE_ANON_KEY) {
  throw new Error('Missing REACT_APP_SUPABASE_ANON_KEY environment variable');
}

// Create Supabase client for client-side operations
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default supabase;
