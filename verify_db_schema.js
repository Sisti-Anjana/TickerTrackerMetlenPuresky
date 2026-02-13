const { supabase } = require('./config/supabase');

async function checkSchema() {
    try {
        console.log('--- Checking sites table columns ---');
        // We can't easily query information_schema in Supabase client, 
        // but we can try to select one row and see the keys.
        const { data: site, error: siteError } = await supabase
            .from('sites')
            .select('*')
            .limit(1);

        if (siteError) {
            console.error('Error fetching site:', siteError);
        } else if (site && site.length > 0) {
            console.log('Site columns:', Object.keys(site[0]));
        } else {
            console.log('No sites found to check columns.');
        }

        console.log('\n--- Checking client_types table columns ---');
        const { data: client, error: clientError } = await supabase
            .from('client_types')
            .select('*')
            .limit(1);

        if (clientError) {
            console.error('Error fetching client type:', clientError);
        } else if (client && client.length > 0) {
            console.log('Client type columns:', Object.keys(client[0]));
        } else {
            console.log('No client types found to check columns.');
        }

        // Try a dummy insert for sites to see if description is rejected
        console.log('\n--- Testing dummy insert for sites with description ---');
        const testSite = {
            name: 'DB_VERIFY_TEST_' + Date.now(),
            client_type_id: 1, // Assuming id 1 exists
            description: 'Test description verify'
        };
        const { error: insertError } = await supabase
            .from('sites')
            .insert([testSite]);

        if (insertError) {
            console.error('Test insert FAILED:', insertError);
        } else {
            console.log('Test insert SUCCESS! Description column works.');
            // Cleanup
            await supabase.from('sites').delete().eq('name', testSite.name);
        }

    } catch (err) {
        console.error('Exception:', err);
    }
}

checkSchema();
