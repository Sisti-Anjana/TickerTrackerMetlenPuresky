// Simple test script to verify server fixes
const axios = require('axios');

async function testServer() {
  try {
    console.log('🧪 Testing Server Fixes...\n');

    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:5001/api/health');
    console.log('✅ Health check passed:', healthResponse.data.message);

    // Test 2: Database debug
    console.log('\n2. Testing database connection...');
    const dbResponse = await axios.get('http://localhost:5001/api/debug/database');
    console.log('✅ Database connection passed:');
    console.log('   Users:', dbResponse.data.stats.users);
    console.log('   Categories:', dbResponse.data.stats.categories);
    console.log('   Tickets:', dbResponse.data.stats.tickets);

    // Test 3: User registration
    console.log('\n3. Testing user registration...');
    const registerData = {
      name: 'Test User Fix',
      email: `testfix${Date.now()}@example.com`,
      password: 'password123'
    };
    
    const registerResponse = await axios.post('http://localhost:5001/api/auth/register', registerData);
    console.log('✅ Registration passed:', registerResponse.data.user.name);
    const token = registerResponse.data.token;

    // Test 4: Ticket creation
    console.log('\n4. Testing ticket creation...');
    const ticketData = {
      customer_name: 'Test Fix Company',
      customer_type: 'Puresky',
      site_name: 'Site 1',
      equipment: 'Production Meter',
      category: 'Production Impacting',
      site_outage: 'No',
      issue_start_time: '2024-01-15T09:00:00Z',
      issue_end_time: '2024-01-15T11:30:00Z',
      issue_description: 'Fix verification test ticket',
      kw_down: 150.25
    };

    const ticketResponse = await axios.post('http://localhost:5001/api/tickets', ticketData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Ticket creation passed!');
    console.log('   Ticket Number:', ticketResponse.data.ticket_number);
    console.log('   Duration:', ticketResponse.data.total_duration);
    console.log('   Customer:', ticketResponse.data.customer_name);

    console.log('\n🎉 ALL TESTS PASSED! Your server is working perfectly!');
    console.log('\n📋 Next steps:');
    console.log('   1. Open http://localhost:3000 in your browser');
    console.log('   2. Register a user through the UI');
    console.log('   3. Create a ticket through your form');
    console.log('   4. Check if it appears on the dashboard');

  } catch (error) {
    console.log('\n❌ TEST FAILED:');
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
    console.log('\n🔧 Check server logs and make sure:');
    console.log('   1. RLS policies fix was applied in Supabase');
    console.log('   2. Server is running with updated code');
    console.log('   3. Database connection is working');
  }
}

testServer();