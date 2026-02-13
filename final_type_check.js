const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_ANON_KEY);

async function check() {
    const { data: user, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', 'admin@system.local') // Try the admin email we know
        .single();

    if (error) console.log('Query Error 1:', error);
    if (user) {
        console.log(`Admin found. ID value: ${user.id}, Type: ${typeof user.id}`);
    }

    const { data: users, error: usersError } = await supabase.from('users').select('id, email').limit(5);
    if (usersError) console.log('Query Error 2:', usersError);
    console.log('Sample Users:', JSON.stringify(users, null, 2));
}

check();
