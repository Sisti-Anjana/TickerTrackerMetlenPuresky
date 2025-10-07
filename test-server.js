// Test ticket creation by bypassing auth temporarily
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const { supabase } = require('./config/supabase');

// Test endpoint for debugging ticket creation
app.post('/api/test-ticket', async (req, res) => {
  try {
    console.log('=== TEST TICKET CREATION ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    // Prepare minimal ticket data
    const ticketData = {
      user_id: 1, // Use your user ID
      customer_name: 'Test Customer',
      customer_type: 'Puresky',
      asset_name: 'Asset 1',
      site_name: 'Test Site',
      equipment: 'Solar Panel Array',
      category: 'Production Impacting',
      site_outage: 'No',
      ticket_status: 'Open',
      issue_start_time: '2024-01-01T10:00:00',
      issue_end_time: '2024-01-01T12:00:00',
      issue_description: 'Test ticket for debugging',
      priority: 'Medium'
    };

    console.log('📝 Ticket data to insert:', JSON.stringify(ticketData, null, 2));

    const { data: newTicket, error } = await supabase
      .from('tickets')
      .insert([ticketData])
      .select(`
        *,
        users:user_id(name, email)
      `)
      .single();

    if (error) {
      console.error('=== DATABASE INSERT ERROR ===');
      console.error('Error:', JSON.stringify(error, null, 2));
      return res.status(500).json({ 
        message: 'Failed to create ticket', 
        error: error.message,
        details: error
      });
    }

    console.log('=== TICKET CREATED SUCCESSFULLY ===');
    console.log('Created ticket:', JSON.stringify(newTicket, null, 2));

    res.status(201).json({
      ...newTicket,
      message: `Test ticket ${newTicket.ticket_number} created successfully!`,
      success: true
    });

  } catch (error) {
    console.error('=== TEST TICKET ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      message: 'Server error creating test ticket', 
      error: error.message,
      stack: error.stack
    });
  }
});

const PORT = process.env.PORT + 1 || 5002;
app.listen(PORT, () => {
  console.log(`🧪 Test server running on port ${PORT}`);
  console.log(`🔗 Test endpoint: http://localhost:${PORT}/api/test-ticket`);
  console.log('📤 Send POST request to create test ticket');
});
