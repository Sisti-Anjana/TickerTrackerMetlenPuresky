const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

async function fixAdminLogin() {
  console.log('🔧 Starting Admin Login Fix...\n');

  try {
    // Step 1: Check if users table has role column
    console.log('📊 Step 1: Checking database schema...');
    const { data: tableInfo, error: schemaError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (schemaError) {
      console.error('❌ Error checking schema:', schemaError.message);
      return;
    }
    console.log('✅ Database schema is accessible\n');

    // Step 2: Check for existing admin user
    console.log('📊 Step 2: Checking for existing admin user...');
    const { data: existingAdmin, error: adminCheckError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@system.local')
      .single();

    if (adminCheckError && adminCheckError.code !== 'PGRST116') {
      console.error('❌ Error checking admin:', adminCheckError.message);
    }

    // Step 3: Create or update admin user
    if (existingAdmin) {
      console.log('📋 Admin user found. Updating...');
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@123', salt);

      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: 'System Administrator',
          password: hashedPassword,
          role: 'admin',
          must_change_password: false
        })
        .eq('email', 'admin@system.local');

      if (updateError) {
        console.error('❌ Error updating admin:', updateError.message);
      } else {
        console.log('✅ Admin user updated successfully\n');
      }
    } else {
      console.log('📋 No admin user found. Creating new admin...');
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@123', salt);

      const { data: newAdmin, error: insertError } = await supabase
        .from('users')
        .insert([{
          name: 'System Administrator',
          email: 'admin@system.local',
          password: hashedPassword,
          role: 'admin',
          must_change_password: false
        }])
        .select();

      if (insertError) {
        console.error('❌ Error creating admin:', insertError.message);
      } else {
        console.log('✅ Admin user created successfully\n');
      }
    }

    // Step 4: Verify admin user
    console.log('📊 Step 4: Verifying admin user...');
    const { data: verifyAdmin, error: verifyError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('email', 'admin@system.local')
      .single();

    if (verifyError) {
      console.error('❌ Error verifying admin:', verifyError.message);
    } else {
      console.log('✅ Admin user verified:');
      console.log('   Name:', verifyAdmin.name);
      console.log('   Email:', verifyAdmin.email);
      console.log('   Role:', verifyAdmin.role);
      console.log('   ID:', verifyAdmin.id);
      console.log('');
    }

    // Step 5: Check all users
    console.log('📊 Step 5: Listing all users...');
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('❌ Error listing users:', usersError.message);
    } else {
      console.log(`✅ Found ${allUsers.length} users:`);
      allUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - Role: ${user.role || 'user'}`);
      });
      console.log('');
    }

    // Success Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ ADMIN LOGIN FIX COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('📋 LOGIN CREDENTIALS:');
    console.log('   Email:    admin@system.local');
    console.log('   Password: Admin@123');
    console.log('');
    console.log('🌐 HOW TO LOGIN:');
    console.log('   1. Start your servers:');
    console.log('      Terminal 1: npm start');
    console.log('      Terminal 2: cd client && npm start');
    console.log('');
    console.log('   2. Open: http://localhost:3000');
    console.log('');
    console.log('   3. You should see "Welcome to AGS Ticketing System"');
    console.log('      with two cards: "Admin Login" and "User Login"');
    console.log('');
    console.log('   4. Click "Continue as Admin"');
    console.log('');
    console.log('   5. Enter the credentials above');
    console.log('');
    console.log('⚠️  IMPORTANT: Change this password after first login!');
    console.log('═══════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error);
  }
}

// Run the fix
fixAdminLogin();
