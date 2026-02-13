const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const url = 'https://tlnojwnrvvrnujnhdlrr.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsbm9qd25ydnZybnVqbmhkbHJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUyMzA4OCwiZXhwIjoyMDc1MDk5MDg4fQ.pIqe8K3l5k6PKAMLgS1boUDxYL7Ts33u9ZRfsjuH-Bg';
const supabase = createClient(url, key);

async function testCreateUser() {
    const name = 'Test User ' + Date.now();
    const email = 'test' + Date.now() + '@example.com';
    const password = 'password123';

    console.log(`--- Testing Create User: ${email} ---`);

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const { data, error } = await supabase
            .from('users')
            .insert([{
                name: name,
                email: email,
                password: hashedPassword,
                role: 'user',
                must_change_password: true
            }])
            .select('*')
            .single();

        if (error) {
            console.error('❌ Insert Error:', error);
        } else {
            console.log('✅ User created successfully:', data);
        }
    } catch (err) {
        console.error('❌ Catch Error:', err);
    }
}

testCreateUser();
