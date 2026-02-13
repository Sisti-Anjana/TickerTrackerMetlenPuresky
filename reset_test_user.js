const { supabase } = require('./config/supabase');
const bcrypt = require('bcryptjs');

async function resetTestUser() {
    const email = 'test@example.com';
    const password = 'password123';

    console.log(`Resetting password for ${email}...`);

    try {
        // Check if user exists first
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            console.error('Error checking user:', checkError);
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (existingUser) {
            console.log('User exists, updating password...');
            const { error: updateError } = await supabase
                .from('users')
                .update({ password: hashedPassword })
                .eq('email', email);

            if (updateError) console.error('Update failed:', updateError);
            else console.log('Password updated successfully.');
        } else {
            console.log('User does not exist, creating...');
            const { error: insertError } = await supabase
                .from('users')
                .insert([{
                    name: 'Test User',
                    email: email,
                    password: hashedPassword,
                    role: 'user'
                }]);

            if (insertError) console.error('Insert failed:', insertError);
            else console.log('User created successfully.');
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

resetTestUser();
