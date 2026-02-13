const { supabase } = require('./config/supabase');

async function debugRLS() {
    console.log('Debugging RLS (Verbose)...');

    // 1. Check anonymous access
    console.log('Attempting to select user with Anon Key...');
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email, role')
        .limit(1)
        .single();

    if (userError) {
        console.log('❌ SELECT FAILED');
        console.log('Error Code:', userError.code);
        console.log('Error Message:', userError.message);
        console.log('Error Hints:', userError.hint);
        console.log('Full Error:', JSON.stringify(userError, null, 2));
    } else {
        console.log('✅ SELECT SUCCESS');
        console.log('User found:', user);
    }

    // 2. Check if we can just count (sometimes easier)
    const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

    console.log('Count Result:', { count, error: countError ? countError.message : 'None' });
}

debugRLS();
