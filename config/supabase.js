// Supabase Configuration for Ticket Management System
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Validate environment variables
if (!process.env.SUPABASE_URL) {
  console.error('❌ Missing required SUPABASE_URL environment variable');
  process.exit(1);
}

if (!process.env.SUPABASE_ANON_KEY) {
  console.error('❌ Missing required SUPABASE_ANON_KEY environment variable');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE environment variable is missing. Some admin operations may fail.');
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

console.log('🔗 Supabase URL:', supabaseUrl);
console.log('🔑 Keys available:', {
  anon: '✅ Present',
  service: supabaseServiceKey ? '✅ Present' : '⚠️ Missing (some admin features may not work)'
});

// Create Supabase client for server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'x-application-name': 'ticket-management-server'
    }
  }
});

// Create Supabase client for client-side operations  
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
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

// Enhanced connection test function
async function testSupabaseConnection() {
  try {
    console.log('=== TESTING SUPABASE CONNECTION ===');
    console.log('🔗 Testing URL:', supabaseUrl);
    
    // Test basic connectivity
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      console.error('Error details:', error);
      return false;
    }
    
    console.log('✅ Supabase connected successfully!');
    
    // Test table access
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['users', 'tickets', 'categories']);
    
    console.log('📋 Available tables:', tables?.map(t => t.table_name) || []);
    
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

// Auto-test connection when module is loaded
testSupabaseConnection().then(success => {
  if (success) {
    console.log('🚀 Supabase module loaded successfully!');
  } else {
    console.error('⚠️ Supabase connection issues detected. Check your configuration.');
  }
}).catch(error => {
  console.error('⚠️ Supabase initialization error:', error.message);
});
