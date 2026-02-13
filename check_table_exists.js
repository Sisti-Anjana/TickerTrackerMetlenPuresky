const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
    console.log('Checking ticket_history table...');

    // Try to insert a dummy record that will fail constraint or just select
    const { data, error } = await supabase
        .from('ticket_history')
        .select('*')
        .limit(1);

    if (error) {
        console.log('❌ Error accessing ticket_history:', error);
        console.log('User probably needs to run the migration.');
    } else {
        console.log('✅ ticket_history table exists and is accessible.');
    }
}

checkTable();
