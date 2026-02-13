const { supabase } = require('./config/supabase');

async function diagnose() {
    try {
        console.log('--- DIAGNOSING CLIENT_TYPES FETCH ---');
        const { data, error } = await supabase
            .from('client_types')
            .select('*, description');

        if (error) {
            console.error('❌ FETCH ERROR:', JSON.stringify(error, null, 2));
        } else {
            console.log('✅ FETCH SUCCESS! Count:', data?.length);
            console.log('Sample data:', data?.[0]);
        }

        console.log('\n--- TRYING WITHOUT DESCRIPTION COLUMN ---');
        const { data: data2, error: error2 } = await supabase
            .from('client_types')
            .select('*');

        if (error2) {
            console.error('❌ FETCH WITHOUT DESC ERROR:', JSON.stringify(error2, null, 2));
        } else {
            console.log('✅ FETCH WITHOUT DESC SUCCESS! Count:', data2?.length);
        }

    } catch (err) {
        console.error('CRITICAL EXCEPTION:', err);
    }
}

diagnose();
