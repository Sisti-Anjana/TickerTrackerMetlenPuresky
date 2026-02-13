require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function debugDirectOptions() {
    console.log('--- START DEBUG DIRECT OPTIONS (NO GLOBAL) ---');

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;

    // TESTING WITHOUT GLOBAL HEADERS
    const supabase = createClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
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
