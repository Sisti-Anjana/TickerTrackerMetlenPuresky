require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

async function debugDirectWithReset() {
    console.log('--- START DEBUG DIRECT WITH RESET ---');

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
        // 1. Diagnostics
        console.log('1. Connection check...');
        const { count, error: countError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        if (countError) {
            console.error('❌ Connection Failed:', countError.message);
            return;
        }
        console.log('✅ Connection OK. Users:', count);

        // 2. Find User
        console.log(`2. Finding user ${email}...`);
        const { data: users, error: findError } = await supabase
            .from('users')
            .select('id, email')
            .eq('email', email);

        if (findError) {
            console.error('❌ Find Failed:', findError.message);
            return;
        }

        const user = users && users.length > 0 ? users[0] : null;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        if (user) {
            console.log('✅ User found (ID:', user.id, '). Updating password...');
            const { error: updateError } = await supabase
                .from('users')
                .update({ password: hashedPassword })
                .eq('id', user.id); // Use ID to be safe

            if (updateError) {
                console.error('❌ Update Failed:', updateError.message);
            } else {
                console.log('✅ Password Updated Successfully!');
            }
        } else {
            console.log('⚠️ User not found. Creating...');
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

    console.log('--- END DEBUG DIRECT WITH RESET ---');
}

debugDirectWithReset();
