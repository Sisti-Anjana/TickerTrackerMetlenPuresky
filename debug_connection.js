const { testSupabaseConnection, supabase, supabaseUrl, supabaseAnonKey } = require('./config/supabase');

async function debugConnection() {
    console.log('--- DEBUG CONNECTION ---');
    console.log('URL:', supabaseUrl);
    console.log('Key length:', supabaseAnonKey ? supabaseAnonKey.length : 0);
    console.log('Supabase client initialized:', !!supabase);

    try {
        const success = await testSupabaseConnection();
        console.log('Connection Test Result:', success);
    } catch (err) {
        console.error('Test threw error:', err);
    }
}

debugConnection();
