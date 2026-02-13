const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetPassword() {
    const email = 'admin@system.local';
    const newPassword = 'Admin@123';
    console.log(`Resetting password for: ${email} to '${newPassword}'...`);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const { data, error } = await supabase
        .from('users')
        .update({
            password: hashedPassword,
            last_password_change: new Date().toISOString()
        })
        .eq('email', email)
        .select();

    if (error) {
        console.error('❌ Error updating password:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('✅ Password reset successful!');
        console.log('User:', data[0]);
    } else {
        console.log('❌ User not found or update failed');
    }
}

resetPassword();
