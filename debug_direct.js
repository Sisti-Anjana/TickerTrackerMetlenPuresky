require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

async function debugDirect() {
    console.log('--- START DEBUG DIRECT ADMIN ---');

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    const supabase = createClient(url, key);

    const email = 'admin@system.local';
    const password = 'Admin@123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log(`Creating/Updating admin ${email}...`);

    // Check if exists first to update
    const { data: existing, error: findError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

    if (existing) {
        console.log('Admin exists, updating password...');
        const { error: updateError } = await supabase
            .from('users')
            .update({
                password: hashedPassword,
                role: 'admin',
                must_change_password: false
            })
            .eq('email', email);

        if (updateError) console.error('❌ Update Error:', updateError.message);
        else console.log('✅ Admin Updated');
    } else {
        console.log('Admin not found, creating...');
        const { data, error } = await supabase
            .from('users')
            .insert([{
                name: 'System Administrator',
                email: email,
                password: hashedPassword,
                role: 'admin',
                must_change_password: false
            }])
            .select();

        if (error) {
            console.error('❌ Insert Error:', error.message);
        } else {
            console.log('✅ Admin Created:', data);
        }
    }
    console.log('--- END DEBUG DIRECT ADMIN ---');
}

debugDirect();
