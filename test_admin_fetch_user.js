const { createClient } = require('@supabase/supabase-js');

const url = 'https://tlnojwnrvvrnujnhdlrr.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsbm9qd25ydnZybnVqbmhkbHJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUyMzA4OCwiZXhwIjoyMDc1MDk5MDg4fQ.pIqe8K3l5k6PKAMLgS1boUDxYL7Ts33u9ZRfsjuH-Bg';
const supabase = createClient(url, key);

async function testFetchUser() {
    const userId = '9'; // The ID that failed
    console.log(`--- Testing Fetch User ID: ${userId} ---`);

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, role, created_at, last_password_change, must_change_password')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('❌ Supabase Error:', error);
            console.error('Code:', error.code);
            console.error('Message:', error.message);
        } else {
            console.log('✅ User found:', user);
        }
    } catch (err) {
        console.error('❌ Catch Error:', err);
    }

    console.log('\n--- Testing with parsed integer ---');
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, role, created_at, last_password_change, must_change_password')
            .eq('id', parseInt(userId))
            .single();

        if (error) {
            console.error('❌ Supabase Error (int):', error);
        } else {
            console.log('✅ User found (int):', user);
        }
    } catch (err) {
        console.error('❌ Catch Error (int):', err);
    }
}

testFetchUser();
