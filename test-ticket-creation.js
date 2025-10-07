const axios = require('axios');

async function testTicketCreation() {
  console.log('🧪 TESTING TICKET CREATION...');
  
  try {
    // First test authentication
    console.log('\n1. Testing Login...');
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'anjanasisti2@gmail.com',
      password: 'your-password-here' // You'll need to put the actual password
    });
    
    console.log('✅ Login successful');
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log('👤 User:', user);
    
    // Test ticket creation
    console.log('\n2. Testing Ticket Creation...');
    const ticketData = {
      customer_name: user.name,
      customer_type: 'Puresky',
      site_name: 'Test Site',
      equipment: 'Solar Panel Array',
      category: 'Production Impacting',
      issue_start_time: '2024-01-01T10:00:00',
      issue_end_time: '2024-01-01T12:00:00',
      issue_description: 'Test ticket for debugging',
      site_outage: 'No',
      ticket_status: 'Open',
      priority: 'Medium'
    };
    
    console.log('📝 Ticket data:', JSON.stringify(ticketData, null, 2));
    
    const ticketResponse = await axios.post('http://localhost:5001/api/tickets', ticketData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Ticket created successfully!');
    console.log('🎫 Ticket:', ticketResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Full error:', error);
  }
}

// Note: You need to update the password above
console.log('⚠️  Please update the password in this script first!');
console.log('   Then run: node test-ticket-creation.js');

// Uncomment this line after updating the password:
// testTicketCreation();
