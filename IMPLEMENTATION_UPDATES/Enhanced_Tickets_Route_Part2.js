// Create new ticket with enhanced validation and user association
router.post('/', auth, async (req, res) => {
  try {
    console.log('=== CREATE TICKET REQUEST ===');
    console.log('User creating ticket:', req.user);
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { supabase } = require('../../config/supabase');
    
    // Enhanced validation
    const requiredFields = ['equipment', 'category', 'issue_start_time', 'issue_end_time', 'issue_description'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
      return res.status(400).json({
        message: 'Missing required fields',
        missingFields: missingFields,
        requiredFields: requiredFields
      });
    }

    // Prepare ticket data with enhanced user association
    const ticketData = {
      user_id: parseInt(req.user.id), // Ensure proper user association
      
      // Customer Information - Use user's name if not provided
      customer_name: req.body.customer_name || req.body.customerName || req.user.name,
      customer_type: req.body.customer_type || req.body.customerType || 'Puresky',
      asset_name: req.body.asset_name || req.body.assetName || 'Asset 1',
      site_name: req.body.site_name || req.body.siteName || 'Site 1',
      
      // Required fields
      equipment: req.body.equipment,
      category: req.body.category,
      issue_start_time: req.body.issue_start_time || req.body.issueStartTime,
      issue_end_time: req.body.issue_end_time || req.body.issueEndTime,
      issue_description: req.body.issue_description || req.body.issueDescription,
      
      // Optional fields with defaults
      site_outage: req.body.site_outage || req.body.siteOutage || 'No',
      ticket_status: req.body.ticket_status || req.body.ticketStatus || 'Open',
      kw_down: req.body.kw_down || req.body.kwDown || null,
      case_number: req.body.case_number || req.body.caseNumber || null,
      additional_notes: req.body.additional_notes || req.body.additionalNotes || null,
      priority: req.body.priority || 'Medium'
    };

    console.log('📝 Prepared ticket data:', JSON.stringify(ticketData, null, 2));

    // Insert ticket into database
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

    // Return success response with ticket data
    res.status(201).json({
      ...newTicket,
      message: `Ticket ${newTicket.ticket_number} created successfully!`,
      success: true,
      created_by: newTicket.users?.name || req.user.name
    });

  } catch (error) {
    console.error('=== CREATE TICKET ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      message: 'Server error creating ticket', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});
