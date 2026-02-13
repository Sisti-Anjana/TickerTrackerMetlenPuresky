require('dotenv').config();
const { supabase } = require('./config/supabase');

async function checkUsersServerConfig() {
    console.log('--- CHECK USERS (SERVER CONFIG) ---');
    const email = 'admin@system.local';
    console.log(`Looking for ${email}...`);

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, password, role')
            .eq('email', email)
            .single();

        if (error) {
            console.error('❌ Supabase Error:', error);
        } else {
            console.log('✅ User Found via Server Config:', user);
        }
    } catch (err) {
        console.error('EXCEPTION:', err);
    }
}

checkUsersServerConfig();
