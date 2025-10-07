const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all tickets with enhanced user data and filtering
router.get('/', auth, async (req, res) => {
  try {
    console.log('=== GET TICKETS REQUEST ===');
    console.log('Requesting user:', req.user);
    
    const { supabase } = require('../../config/supabase');
    const { filter, limit = 50, offset = 0 } = req.query;
    
    let query = supabase
      .from('tickets')
      .select(`
        *,
        users:user_id(name, email, created_at)
      `)
      .order('created_at', { ascending: false });

    // Apply filters if provided
    if (filter === 'my-tickets') {
      query = query.eq('user_id', req.user.id);
      console.log('📋 Filtering tickets for user:', req.user.id);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: tickets, error } = await query;

    if (error) {
      console.error('Get tickets error:', error);
      return res.status(500).json({ 
        message: 'Failed to fetch tickets', 
        error: error.message 
      });
    }

    // Add debugging info
    console.log(`✅ Found ${tickets?.length || 0} tickets`);
    console.log('📊 Sample ticket data:', tickets?.[0] ? {
      id: tickets[0].id,
      ticket_number: tickets[0].ticket_number,
      customer_name: tickets[0].customer_name,
      created_by: tickets[0].users?.name
    } : 'No tickets');

    res.json({
      tickets: tickets || [],
      total: tickets?.length || 0,
      user: req.user,
      filter: filter || 'all',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('=== GET TICKETS ERROR ===');
    console.error('Error details:', error);
    res.status(500).json({ 
      message: 'Server error fetching tickets', 
      error: error.message 
    });
  }
});
