const { createClient } = require('@supabase/supabase-js');

const url = 'https://tlnojwnrvvrnujnhdlrr.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsbm9qd25ydnZybnVqbmhkbHJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUyMzA4OCwiZXhwIjoyMDc1MDk5MDg4fQ.pIqe8K3l5k6PKAMLgS1boUDxYL7Ts33u9ZRfsjuH-Bg';
const supabase = createClient(url, key);

async function testColumns() {
    console.log('--- Testing specific columns ---');

    const columnsToTest = ['last_password_change', 'must_change_password'];

    for (const col of columnsToTest) {
        console.log(`Testing column: ${col}`);
        const { data, error } = await supabase
            .from('users')
            .select(col)
            .limit(1);

        if (error) {
            console.error(`❌ Column ${col} ERROR:`, error.message);
        } else {
            console.log(`✅ Column ${col} EXISTS`);
        }
    }
}

testColumns();
