const { createClient } = require('@supabase/supabase-js');

const url = 'https://tlnojwnrvvrnujnhdlrr.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsbm9qd25ydnZybnVqbmhkbHJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUyMzA4OCwiZXhwIjoyMDc1MDk5MDg4fQ.pIqe8K3l5k6PKAMLgS1boUDxYL7Ts33u9ZRfsjuH-Bg';
const supabase = createClient(url, key);

async function checkSchema() {
    console.log('--- Checking Users Table Schema ---');

    // Method 1: Inspect a user row to see returned columns
    const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching user:', error);
    } else if (users && users.length > 0) {
        console.log('Columns found:', Object.keys(users[0]));
    } else {
        console.log('No users found to inspect columns');
    }
}

checkSchema();
