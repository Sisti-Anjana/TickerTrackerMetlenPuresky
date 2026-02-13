require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function listUsers() {
    console.log('--- LIST USERS ---');

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    const supabase = createClient(url, key);

    const { data: users, error } = await supabase
        .from('users')
        .select('id, email, password, role');

    if (error) {
        console.error('❌ Error:', error.message);
    } else {
        console.log('✅ Users Found:', users.length);
        users.forEach(u => {
            console.log(` - Email: ${u.email}`);
            console.log(`   ID: ${u.id}`);
            console.log(`   Role: ${u.role}`);
            console.log(`   Password: ${u.password ? (u.password.substring(0, 10) + '...') : 'NULL'}`);
        });
    }
}

listUsers();
