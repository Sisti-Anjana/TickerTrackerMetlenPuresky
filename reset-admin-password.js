const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://tlnojwnrvvrnujnhdlrr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsbm9qd25ydnZybnVqbmhkbHJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MjMwODgsImV4cCI6MjA3NTA5OTA4OH0.RO8AHtbWFPcqbUCpKylS5mXA24pSIWpQ5kXIs2Gs_BM'
);

async function resetAdminPassword() {
  const newPassword = 'Admin@123';
  
  console.log('🔧 Resetting admin password...\n');
  
  // Generate new password hash
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  
  console.log('✅ New password hash generated');
  console.log('Hash:', hashedPassword);
  
  // Update the admin user
  const { data, error } = await supabase
    .from('users')
    .update({ 
      password: hashedPassword,
      must_change_password: false,
      last_password_change: new Date().toISOString()
    })
    .eq('email', 'admin@system.local')
    .select();
  
  if (error) {
    console.error('❌ Error updating password:', error.message);
    return;
  }
  
  console.log('\n✅ Admin password has been reset successfully!');
  console.log('\n📋 New Login Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Email:    admin@system.local');
  console.log('Password: Admin@123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n🎯 You can now login with these credentials!');
}

resetAdminPassword().catch(console.error);
