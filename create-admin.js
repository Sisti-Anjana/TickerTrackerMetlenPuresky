const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://tlnojwnrvvrnujnhdlrr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // Check if admin already exists
    const { data: existing } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@system.local')
      .single();
      
    if (existing) {
      console.log('❌ Admin user already exists!');
      console.log('Email:', existing.email);
      console.log('Role:', existing.role);
      return;
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Create admin user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        name: 'System Administrator',
        email: 'admin@system.local',
        password: hashedPassword,
        role: 'admin',
        must_change_password: false
      }])
      .select('*')
      .single();
      
    if (error) {
      console.error('❌ Error creating admin:', error);
      return;
    }
    
    console.log('✅ Admin user created successfully!');
    console.log('===============================');
    console.log('Email: admin@system.local');
    console.log('Password: admin123');
    console.log('Role:', newUser.role);
    console.log('===============================');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createAdminUser();
