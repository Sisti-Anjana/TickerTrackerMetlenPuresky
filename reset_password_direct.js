require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

async function resetPasswordDirect() {
    console.log('--- START RESET DIRECT ---');

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.error('Missing config!');
        return;
    }

    const supabase = createClient(url, key);
    const email = 'test@example.com';
    const newPassword = 'password123';

    try {
        // 1. Check if user exists
        console.log(`Checking for user ${email}...`);
        const { data: user, error: findError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (findError && findError.code !== 'PGRST116') {
            console.error('❌ Check Failed:', findError.message);
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        if (user) {
            console.log('User found. Updating password...');
            const { error: updateError } = await supabase
                .from('users')
                .update({ password: hashedPassword })
                .eq('email', email);

            if (updateError) {
                console.error('❌ Update Failed:', updateError.message);
            } else {
                console.log('✅ Password Updated Successfully!');
            }
        } else {
            console.log('User not found. Creating...');
            const { error: insertError } = await supabase
                .from('users')
                .insert([{
                    name: 'Test User',
                    email: email,
                    password: hashedPassword,
                    role: 'user'
                }]);

            if (insertError) {
                console.error('❌ Insert Failed:', insertError.message);
            } else {
                console.log('✅ User Created Successfully!');
            }
        }

    } catch (err) {
        console.error('EXCEPTION:', err);
    }

    console.log('--- END RESET DIRECT ---');
}

resetPasswordDirect();
