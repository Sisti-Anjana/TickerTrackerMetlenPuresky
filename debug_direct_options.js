require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function debugDirectOptions() {
    console.log('--- START DEBUG DIRECT OPTIONS ---');

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.error('Missing config!');
        return;
    }

    // REPLICATING CONFIG/SUPABASE.JS OPTIONS EXACTLY
    console.log('Creating client with server options...');
    const supabase = createClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        },
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
            console.error('Details:', JSON.stringify(countError, null, 2));
        } else {
            console.log('✅ Connection OK. User Count:', count);
        }

    } catch (err) {
        console.error('EXCEPTION:', err);
    }

    console.log('--- END DEBUG DIRECT OPTIONS ---');
}

debugDirectOptions();
