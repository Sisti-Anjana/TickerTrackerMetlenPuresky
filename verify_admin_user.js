const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('Using Key (first 10 chars):', supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'NONE');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
    const email = 'admin@system.local';
    console.log(`Checking for user: ${email}...`);

    const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email);

    if (error) {
        console.error('❌ Error fetching user:', error);
        return;
    }

    if (users && users.length > 0) {
        console.log('✅ User found:', users[0]);
        console.log('Password hash:', users[0].password);
        console.log('Role:', users[0].role);
    } else {
        console.log('❌ User NOT found');

        // List first 5 users to see who exists
        const { data: allUsers } = await supabase.from('users').select('email, role').limit(5);
        console.log('Existing users:', allUsers);
    }
}

checkUser();
