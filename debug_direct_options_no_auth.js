require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function debugDirectOptions() {
    console.log('--- START DEBUG DIRECT OPTIONS (NO AUTH) ---');

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;

    // TESTING WITHOUT AUTH OPTIONS
    // But keeping global to check if global was breaking too
    const supabase = createClient(url, key, {
        global: {
            headers: {
                'x-application-name': 'ticket-management-server'
            }
        }
    });

    try {
        console.log('Testing Connection (public.users count)...');
        const { count, error: countError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        if (countError) {
            console.error('❌ Connection Failed:', countError.message);
        } else {
            console.log('✅ Connection OK. User Count:', count);
        }

    } catch (err) {
        console.error('EXCEPTION:', err);
    }
}

debugDirectOptions();
