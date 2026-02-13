const { supabase } = require('./config/supabase');

async function checkSchema() {
    try {
        console.log('--- STARTING VERBOSE SCHEMA CHECK ---');

        // 1. Check client_types
        console.log('1. Checking client_types...');
        const { data: clients, error: clientError } = await supabase
            .from('client_types')
            .select('*')
            .limit(1);

        if (clientError) {
            console.log('❌ Error selecting from client_types:', JSON.stringify(clientError, null, 2));
        } else if (clients && clients.length > 0) {
            console.log('✅ client_types has columns:', Object.keys(clients[0]).join(', '));
        } else {
            console.log('❓ client_types is empty.');
        }

        // 2. Check sites
        console.log('\n2. Checking sites...');
        const { data: sites, error: siteError } = await supabase
            .from('sites')
            .select('*')
            .limit(1);

        if (siteError) {
            console.log('❌ Error selecting from sites:', JSON.stringify(siteError, null, 2));
        } else if (sites && sites.length > 0) {
            console.log('✅ sites has columns:', Object.keys(sites[0]).join(', '));
        } else {
            console.log('❓ sites is empty.');
        }

        // 3. Check for specific 'description' column explicitly
        console.log('\n3. Explicit check for description column in sites...');
        const { error: descCheckError } = await supabase
            .from('sites')
            .select('description')
            .limit(1);

        if (descCheckError) {
            console.log('❌ description column MISSING or errored in sites:', JSON.stringify(descCheckError, null, 2));
        } else {
            console.log('✅ description column EXISTS in sites.');
        }

        // 4. Test insert
        console.log('\n4. Testing insert with description...');
        const { data: insertData, error: insertError } = await supabase
            .from('sites')
            .insert([{
                name: 'SCHEMA_DRIVE_TEST',
                client_type_id: 1, // Assuming id 1 exists? If not, this might fail with foreign key
                description: 'test'
            }])
            .select();

        if (insertError) {
            console.log('❌ Insert FAILED:', JSON.stringify(insertError, null, 2));
        } else {
            console.log('✅ Insert SUCCESS:', JSON.stringify(insertData, null, 2));
            // Cleanup
            await supabase.from('sites').delete().eq('name', 'SCHEMA_DRIVE_TEST');
        }

    } catch (err) {
        console.error('CRITICAL EXCEPTION:', err);
    }
}

checkSchema();
