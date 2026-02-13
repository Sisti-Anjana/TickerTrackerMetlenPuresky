const { supabase } = require('./config/supabase');

async function debugRLS() {
    console.log('Debugging RLS...');

    // Try to count users - usually blocked by RLS for anon
    const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

    console.log('Count Users Result:', { count, error: countError });

    // Try to select specific user (simulating login)
    const email = 'test@example.com';
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('email', email)
        .single();

    console.log(`Select User (${email}) Result:`, { user, error: userError });

    // Check if we have service role key
    const isServiceRole = process.env.SUPABASE_SERVICE_ROLE && process.env.SUPABASE_SERVICE_ROLE.includes('eyJ');
    console.log('Has Service Role Key:', isServiceRole);

    if (userError) {
        console.log('FAILURE: Cannot select user. RLS likely blocking access because we are using Anon key.');
    } else {
        console.log('SUCCESS: User found.');
    }

}

debugRLS();
