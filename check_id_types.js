const { supabase } = require('./config/supabase');

async function checkIds() {
    try {
        console.log('--- Checking client_types table ids ---');
        const { data: clients, error: clientError } = await supabase
            .from('client_types')
            .select('id, name')
            .limit(5);

        if (clientError) {
            console.error('Error fetching client type:', clientError);
        } else if (clients && clients.length > 0) {
            console.log('Client type IDs:', clients.map(c => ({ id: c.id, type: typeof c.id, name: c.name })));
        } else {
            console.log('No client types found.');
        }

        console.log('\n--- Checking sites table client_type_id column ---');
        // Let's try to get one site if it exists
        const { data: sites, error: siteError } = await supabase
            .from('sites')
            .select('client_type_id')
            .limit(1);

        if (siteError) {
            console.error('Error fetching site:', siteError);
        } else if (sites && sites.length > 0) {
            console.log('Site client_type_id:', sites[0].client_type_id, 'type:', typeof sites[0].client_type_id);
        }

    } catch (err) {
        console.error('Exception:', err);
    }
}

checkIds();
