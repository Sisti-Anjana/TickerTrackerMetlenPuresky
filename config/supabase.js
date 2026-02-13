// Supabase Configuration for Ticket Management System
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Validate environment variables (don't exit, just warn)
let supabaseUrl, supabaseAnonKey, supabaseServiceKey;
let supabase, supabaseAnon;

if (!process.env.SUPABASE_URL) {
  console.error('❌ Missing required SUPABASE_URL environment variable');
  console.error('⚠️ Server will start but database operations will fail');
} else if (!process.env.SUPABASE_ANON_KEY) {
  console.error('❌ Missing required SUPABASE_ANON_KEY environment variable');
  console.error('⚠️ Server will start but database operations will fail');
} else {
  supabaseUrl = process.env.SUPABASE_URL;
  supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

  console.log('🔗 Supabase URL:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NOT SET');
  console.log('🔑 Keys available:', {
    anon: supabaseAnonKey ? '✅ Present' : '❌ Missing',
    service: supabaseServiceKey ? '✅ Present' : '⚠️ Missing (some admin features may not work)'
  });

  // Create Supabase client for server-side operations
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

    // Create Supabase client for client-side operations  
    supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true
      },
      global: {
        headers: {
          'x-application-name': 'ticket-management-client'
        }
      }
    });
  } catch (error) {
    console.error('❌ Failed to create Supabase clients:', error.message);
    supabase = null;
    supabaseAnon = null;
  }
}

// Enhanced connection test function
async function testSupabaseConnection() {
  try {
    if (!supabase || !supabaseUrl) {
      console.error('❌ Supabase not configured - cannot test connection');
      return false;
    }

    console.log('=== TESTING SUPABASE CONNECTION ===');
    console.log('🔗 Testing URL:', supabaseUrl.substring(0, 30) + '...');

    // Test basic connectivity with timeout
    const connectionPromise = supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .limit(1);

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
    );

    const { data, error } = await Promise.race([connectionPromise, timeoutPromise]);

    if (error) {
      console.error('❌ Connection failed:', error.message);
      console.error('Error details:', error);
      return false;
    }

    console.log('✅ Supabase connected successfully!');
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}

// Helper function to get database stats
async function getDatabaseStats() {
  try {
    const { data: userCount } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true });

    const { data: ticketCount } = await supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true });

    return {
      users: userCount || 0,
      tickets: ticketCount || 0
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return { users: 0, tickets: 0 };
  }
}

// Export everything needed
module.exports = {
  supabase,
  supabaseAnon,
  supabaseUrl,
  supabaseAnonKey,
  supabaseServiceKey,
  testSupabaseConnection,
  getDatabaseStats
};

// Auto-test connection when module is loaded (non-blocking)
// Don't wait for this to complete before exporting
setTimeout(() => {
  testSupabaseConnection().then(success => {
    if (success) {
      console.log('🚀 Supabase module loaded successfully!');
    } else {
      console.error('⚠️ Supabase connection issues detected. Check your configuration.');
    }
  }).catch(error => {
    console.error('⚠️ Supabase initialization error:', error.message);
  });
}, 1000); // Wait 1 second for server to start, then test
