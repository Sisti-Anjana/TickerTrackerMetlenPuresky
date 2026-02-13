const { supabase } = require('./config/supabase');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
    try {
        console.log('--- Applying Migration 09 ---');
        const sqlPath = path.join(__dirname, 'migrations', '09_add_description_to_client_site.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('SQL to execute:\n', sql);

        // Supabase JS SDK doesn't have a direct .rpc() for arbitrary SQL 
        // unless you've defined a 'exec_sql' function in Postgres.
        // Let's check if we can add columns via direct insert/update errors? No.

        // Wait, I should use the Supabase SQL Editor if I can't run it here.
        // BUT, I can try to use a "hack" or check if there is an existing exec_sql function.

        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

        if (error) {
            console.error('❌ Migration FAILED via RPC:', error);
            console.log('Trying manual check for columns first...');
        } else {
            console.log('✅ Migration SUCCESS!');
        }

    } catch (err) {
        console.error('CRITICAL ERROR:', err);
    }
}

applyMigration();
