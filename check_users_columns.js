const { createClient } = require('@supabase/supabase-js');

const url = 'https://tlnojwnrvvrnujnhdlrr.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsbm9qd25ydnZybnVqbmhkbHJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUyMzA4OCwiZXhwIjoyMDc1MDk5MDg4fQ.pIqe8K3l5k6PKAMLgS1boUDxYL7Ts33u9ZRfsjuH-Bg';
const supabase = createClient(url, key);

async function checkSchema() {
    console.log('--- Checking Users Table Columns ---');
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else if (data && data.length > 0) {
        console.log('Columns:', JSON.stringify(Object.keys(data[0])));
    } else {
        // If no rows, try a different approach to at least see if it exists
        console.log('No rows found in users table.');
    }
}

checkSchema();
