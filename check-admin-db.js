require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://tlnojwnrvvrnujnhdlrr.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsbm9qd25ydnZybnVqbmhkbHJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MjMwODgsImV4cCI6MjA3NTA5OTA4OH0.RO8AHtbWFPcqbUCpKylS5mXA24pSIWpQ5kXIs2Gs_BM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdmin() {
  console.log('Querying admin user from database...\n');
  
  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, email, password, role')
    .eq('email', 'admin@system.local')
    .single();
  
  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }
  
  if (!user) {
    console.log('❌ No admin user found');
    return;
  }
  
  console.log('✅ Admin user found:');
  console.log('ID:', user.id);
  console.log('Name:', user.name);
  console.log('Email:', user.email);
  console.log('Role:', user.role);
  console.log('Password Hash:', user.password);
  console.log('\n📝 Password hash length:', user.password?.length || 0);
  console.log('📝 Starts with $2:', user.password?.startsWith('$2'));
}

checkAdmin();
