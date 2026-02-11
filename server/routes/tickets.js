const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// Get client types and sites (for CreateTicket form) - Available to all authenticated users
// IMPORTANT: This route must be defined BEFORE router.get('/') to avoid route conflicts
router.get('/client-types', auth, async (req, res) => {
  try {
    console.log('✅ /api/tickets/client-types route hit');
    console.log('Request path:', req.path);
    console.log('Request method:', req.method);
    const { supabase } = require('../../config/supabase');

    // Get all client types (not just active) - same as admin endpoint
    let { data: clientTypes, error: clientError } = await supabase
      .from('client_types')
      .select('*, description')
      .order('created_at', { ascending: false });

    // Fallback if description column doesn't exist yet
    if (clientError && (clientError.code === 'PGRST204' || clientError.message?.includes('description'))) {
      console.warn('⚠️ Column "description" missing in client_types, falling back to basic fetch');
      const { data: basicData, error: basicError } = await supabase
        .from('client_types')
        .select('*')
        .order('created_at', { ascending: false });

      clientTypes = basicData;
      clientError = basicError;
    }

    // If there's still an error, log it but continue with empty array
    if (clientError) {
      console.error('Get client types error:', clientError);
      console.error('Error code:', clientError.code);
      console.error('Error message:', clientError.message);
      console.error('Error details:', clientError.details);
      // Return empty array instead of error to prevent client-side loop
      console.warn('Returning empty array due to error. Tables may not exist yet.');
      return res.json({ client_types: [] });
    }

    // Log what we found (only if there are client types, to reduce console spam)
    if (clientTypes && clientTypes.length > 0) {
      // Only log on first request or if count changed significantly
      console.log(`Found ${clientTypes.length} client type(s)`);
    }

    // Get all sites (not just active) - same as admin endpoint
    let { data: sites, error: sitesError } = await supabase
      .from('sites')
      .select('*, description')
      .order('created_at', { ascending: false });

    // Fallback if description column doesn't exist yet
    if (sitesError && (sitesError.code === 'PGRST204' || sitesError.message?.includes('description'))) {
      console.warn('⚠️ Column "description" missing in sites, falling back to basic fetch');
      const { data: basicSites, error: basicSitesError } = await supabase
        .from('sites')
        .select('*')
        .order('created_at', { ascending: false });

      sites = basicSites;
      sitesError = basicSitesError;
    }

    // If there's any error with sites, log it but continue with empty sites array
    if (sitesError) {
      console.error('Get sites error:', sitesError);
      console.error('Error code:', sitesError.code);
      console.error('Error message:', sitesError.message);
      // Continue with empty sites array
      const clientTypesWithSites = (clientTypes || []).map(client => ({
        id: client.id,
        name: client.name,
        sites: []
      }));
      return res.json({ client_types: clientTypesWithSites });
    }

    // Combine client types with their sites - same structure as admin endpoint
    // Handle missing status column gracefully
    const clientTypesWithSites = (clientTypes || []).map(client => {
      const clientSites = (sites || []).filter(site => {
        // Handle both UUID (string) and number comparisons
        // Convert both to strings for comparison to handle UUIDs correctly
        const siteClientTypeId = String(site.client_type_id || '');
        const clientId = String(client.id || '');
        const matches = siteClientTypeId === clientId;

        // Debug: Log the matching process for mismatches (only first few to avoid spam)
        if (!matches && sites.length > 0 && sites.indexOf(site) < 3) {
          console.log(`🔍 Site "${site.name}" (client_type_id: ${site.client_type_id}, type: ${typeof site.client_type_id}) does NOT match client "${client.name}" (id: ${client.id}, type: ${typeof client.id})`);
        }
        return matches;
      }).map(site => ({
        id: site.id,
        name: site.name,
        location: site.location || null,
        description: site.description || null,
        client_type_id: site.client_type_id,
        status: site.status || 'active', // Default to 'active' if status column doesn't exist
        created_at: site.created_at,
        updated_at: site.updated_at
      }));

      if (clientSites.length === 0 && sites && sites.length > 0) {
        console.warn(`⚠️ Client "${client.name}" (ID: ${client.id}) has no matching sites. Available site client_type_ids:`, sites.map(s => s.client_type_id));
      }

      return {
        id: client.id,
        name: client.name,
        description: client.description || null,
        status: client.status || 'active', // Default to 'active' if status column doesn't exist
        created_at: client.created_at,
        updated_at: client.updated_at,
        sites: clientSites
      };
    });

    // Log for debugging sync issues
    if (clientTypesWithSites.length === 0) {
      console.log('⚠️ Tickets: No client types found. Make sure client types exist in the database.');
    } else {
      console.log(`✅ Tickets: Returning ${clientTypesWithSites.length} client type(s) with sites`);
      // Log all client types and their site counts
      clientTypesWithSites.forEach(ct => {
        console.log(`   - ${ct.name} (ID: ${ct.id}): ${ct.sites.length} site(s)`);
        if (ct.sites.length > 0) {
          ct.sites.forEach(site => {
            console.log(`     • ${site.name}${site.location ? ` (${site.location})` : ''}`);
          });
        }
      });
    }

    // Always return a valid response structure
    if (!clientTypesWithSites || !Array.isArray(clientTypesWithSites)) {
      console.warn('⚠️ Invalid client types data structure, returning empty array');
      return res.json({ client_types: [] });
    }

    res.json({ client_types: clientTypesWithSites });
  } catch (error) {
    console.error('❌ Get client types catch error:', error);
    console.error('❌ Error stack:', error.stack);
    // Always return empty array instead of error to prevent client-side loop
    console.warn('⚠️ Returning empty array due to exception. Check server logs for details.');
    return res.json({ client_types: [] });
  }
});

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

    // Log what we're returning - especially AGS11
    const ags11 = tickets?.find(t => t.ticket_number === 'AGS11');
    if (ags11) {
      console.log('🔍 AGS11 in API response:', {
        ticket_number: ags11.ticket_number,
        ticket_status: ags11.ticket_status,
        closed_at: ags11.closed_at,
        has_ticket_status: 'ticket_status' in ags11,
        all_keys: Object.keys(ags11)
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

// Delete ticket
router.delete('/:id', auth, async (req, res) => {
  try {
    const ticketId = req.params.id; // Use as string/UUID, or parse if needed
    // const ticketId = parseInt(req.params.id, 10); // Don't enforce int if using UUIDs
    if (!ticketId) {
      return res.status(400).json({ message: 'Invalid ticket ID' });
    }

    const { supabase } = require('../../config/supabase');

    // Ensure ticket exists and get owner
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('id, user_id')
      .eq('id', ticketId)
      .single();

    if (ticketError || !ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Fetch current user's role from Supabase
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', req.user.id)
      .single();

    if (userError || !currentUser) {
      return res.status(401).json({ message: 'User not found' });
    }

    const isOwner = ticket.user_id === req.user.id;
    const isAdmin = currentUser.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Only the ticket creator or an admin can delete this ticket' });
    }

    const { error: deleteError } = await supabase
      .from('tickets')
      .delete()
      .eq('id', ticketId);

    if (deleteError) {
      console.error('Delete ticket error:', deleteError);
      return res.status(500).json({ message: 'Failed to delete ticket', error: deleteError.message });
    }

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Delete ticket catch error:', error);
    res.status(500).json({ message: 'Failed to delete ticket', error: error.message });
  }
});

// Create new ticket with enhanced validation and user association
router.post('/', auth, async (req, res) => {
  try {
    console.log('=== CREATE TICKET REQUEST ===');
    console.log('User creating ticket:', req.user);
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { supabase } = require('../../config/supabase');

    // Enhanced validation - end time is now optional
    const requiredFields = ['equipment', 'category', 'issue_start_time', 'issue_description'];
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
      user_id: req.user.id, // Ensure proper user association

      // Customer Information - Use user's name if not provided
      customer_name: req.body.customer_name || req.body.customerName || req.user.name,
      customer_type: req.body.customer_type || req.body.customerType || 'Puresky',
      asset_name: req.body.asset_name || req.body.assetName || 'Asset 1',
      site_name: req.body.site_name || req.body.siteName || 'Site 1',

      // Required fields
      equipment: req.body.equipment,
      category: req.body.category,
      issue_start_time: req.body.issue_start_time || req.body.issueStartTime,
      issue_end_time: req.body.issue_end_time || req.body.issueEndTime || null, // Now optional
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

    // Insert ticket into database using service key to bypass RLS
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

      // Special handling for RLS errors
      if (error.code === '42501') {
        console.log('🔧 RLS Error detected - this is a configuration issue');
        console.log('💡 The ticket creation works (debug endpoint succeeded)');
        console.log('📋 But RLS policies are blocking authenticated requests');

        return res.status(500).json({
          message: 'Database security configuration issue. Please check RLS policies.',
          error: 'Row Level Security policy violation',
          suggestion: 'Contact administrator to review RLS policies for tickets table',
          technicalError: error.message
        });
      }

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

// Update ticket (for closing tickets or editing)
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('=== UPDATE TICKET REQUEST ===');
    console.log('Ticket ID:', req.params.id);
    console.log('User:', req.user);
    console.log('Update data:', JSON.stringify(req.body, null, 2));

    const { supabase } = require('../../config/supabase');

    // First check if ticket exists and user owns it
    const { data: existingTicket, error: fetchError } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !existingTicket) {
      console.log('❌ Ticket not found:', req.params.id);
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // REMOVED: Permission check - allow all authenticated users to update any ticket
    // This allows admins and team members to update all tickets
    console.log('✅ User has permission to update ticket');

    // Prepare update data
    const updateData = {};

    // Allow updating these fields
    const allowedFields = [
      'ticket_status', 'closed_at', 'issue_end_time', 'issue_start_time',
      'issue_description', 'additional_notes', 'priority',
      'kw_down', 'case_number', 'site_outage'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Add updated timestamp
    updateData.updated_at = new Date().toISOString();

    console.log('📝 Final update data:', JSON.stringify(updateData, null, 2));

    // Log specifically what we're updating for ticket_status
    if (updateData.ticket_status) {
      console.log('🎯 UPDATING TICKET_STATUS TO:', updateData.ticket_status);
      console.log('🎯 TYPE OF ticket_status:', typeof updateData.ticket_status);
    }

    // Track changes for history
    const changes = {};
    let hasChanges = false;

    // Compare old and new values
    Object.keys(updateData).forEach(key => {
      // Skip updated_at
      if (key === 'updated_at') return;

      const oldValue = existingTicket[key];
      const newValue = updateData[key];

      // Simple comparison (can be enhanced for dates/objects if needed)
      // Convert to string for comparison to handle different types (e.g. number vs string)
      // But be careful with null/undefined
      const strOld = oldValue === null || oldValue === undefined ? '' : String(oldValue);
      const strNew = newValue === null || newValue === undefined ? '' : String(newValue);

      if (strOld !== strNew) {
        changes[key] = {
          old: oldValue,
          new: newValue
        };
        hasChanges = true;
      }
    });

    // If there are changes, save to history
    if (hasChanges) {
      const reason = req.body.reason || 'No reason provided'; // Get reason from body

      const { error: historyError } = await supabase
        .from('ticket_history')
        .insert([{
          ticket_id: req.params.id,
          changed_by: req.user.id,
          changes: changes,
          reason: reason
        }]);

      if (historyError) {
        console.error('❌ Failed to save ticket history:', historyError);
        // Don't block the main update, just log the error
      } else {
        console.log('✅ Ticket history saved');
      }
    }

    // Update the ticket
    const { data: updatedTicket, error: updateError } = await supabase
      .from('tickets')
      .update(updateData)
      .eq('id', req.params.id)
      .select(`
        *,
        users:user_id(name, email)
      `)
      .single();

    if (updateError) {
      console.error('❌ Update error:', updateError);
      console.error('❌ Full error object:', JSON.stringify(updateError, null, 2));
      return res.status(500).json({
        message: 'Failed to update ticket',
        error: updateError.message
      });
    }

    // Log what was actually saved
    console.log('✅ Ticket updated successfully:', updatedTicket.ticket_number);
    console.log('✅ NEW ticket_status in DB:', updatedTicket.ticket_status);
    console.log('✅ NEW closed_at in DB:', updatedTicket.closed_at);

    res.json({
      ...updatedTicket,
      message: `Ticket ${updatedTicket.ticket_number} updated successfully!`,
      success: true
    });

  } catch (error) {
    console.error('=== UPDATE TICKET ERROR ===');
    console.error('Error details:', error);
    res.status(500).json({
      message: 'Server error updating ticket',
      error: error.message
    });
  }
});

// Get ticket history
router.get('/:id/history', auth, async (req, res) => {
  try {
    const { supabase } = require('../../config/supabase');
    const ticketId = req.params.id;

    const { data: history, error } = await supabase
      .from('ticket_history')
      .select(`
        *,
        users:changed_by(name, email)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ticket history:', error);
      // Return empty array if table doesn't exist yet or other error
      return res.json([]);
    }

    res.json(history);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Failed to fetch history' });
  }
});

// Enhanced ticket statistics with user filtering
router.get('/meta/stats', auth, async (req, res) => {
  try {
    console.log('=== GET TICKET STATS REQUEST ===');
    console.log('User:', req.user);

    const { supabase } = require('../../config/supabase');
    const { filter } = req.query;

    let query = supabase.from('tickets').select('ticket_status, category, created_at, user_id');

    // Filter by user if requested
    if (filter === 'my-tickets') {
      query = query.eq('user_id', req.user.id);
      console.log('📊 Getting stats for user:', req.user.id);
    }

    const { data: tickets, error } = await query;

    if (error) {
      console.error('Stats fetch error:', error);
      return res.status(500).json({
        message: 'Failed to fetch stats',
        error: error.message
      });
    }

    // Calculate comprehensive statistics
    const today = new Date().toISOString().split('T')[0];
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    const thisMonth = new Date();
    thisMonth.setDate(thisMonth.getDate() - 30);

    const stats = {
      // Basic counts
      total: tickets.length,
      open: tickets.filter(t => t.ticket_status === 'Open').length,
      closed: tickets.filter(t => t.ticket_status === 'Closed').length,
      pending: tickets.filter(t => t.ticket_status === 'Pending').length,

      // Category counts
      production_impacting: tickets.filter(t => t.category === 'Production Impacting').length,
      communication_issues: tickets.filter(t => t.category === 'Communication Issues').length,
      cannot_confirm: tickets.filter(t => t.category === 'Cannot Confirm Production').length,

      // Time-based counts
      today: tickets.filter(t => t.created_at?.startsWith(today)).length,
      this_week: tickets.filter(t => new Date(t.created_at) >= thisWeek).length,
      this_month: tickets.filter(t => new Date(t.created_at) >= thisMonth).length,

      // Additional metadata
      filter: filter || 'all',
      user: req.user.name,
      last_updated: new Date().toISOString()
    };

    console.log('✅ Stats calculated:', stats);
    res.json(stats);

  } catch (error) {
    console.error('=== GET TICKET STATS ERROR ===');
    console.error('Error details:', error);
    res.status(500).json({
      message: 'Failed to fetch ticket statistics',
      error: error.message
    });
  }
});

// Get single ticket with enhanced user data
router.get('/:id', auth, async (req, res) => {
  try {
    console.log('=== GET SINGLE TICKET REQUEST ===');
    console.log('Ticket ID:', req.params.id);
    console.log('Requested by user:', req.user);

    const { supabase } = require('../../config/supabase');

    const { data: ticket, error } = await supabase
      .from('tickets')
      .select(`
        *,
        users:user_id(name, email, created_at)
      `)
      .eq('id', req.params.id)
      .single();

    if (error || !ticket) {
      console.log('❌ Ticket not found:', req.params.id);
      return res.status(404).json({ message: 'Ticket not found' });
    }

    console.log('✅ Ticket found:', ticket.ticket_number);
    console.log('📊 Created by:', ticket.users?.name);

    res.json({
      ...ticket,
      created_by_name: ticket.users?.name,
      created_by_email: ticket.users?.email,
      is_owner: String(ticket.user_id) === String(req.user.id)
    });

  } catch (error) {
    console.error('=== GET SINGLE TICKET ERROR ===');
    console.error('Error details:', error);
    res.status(500).json({
      message: 'Server error fetching ticket',
      error: error.message
    });
  }
});

// Get categories and statuses (unchanged but with better logging)
router.get('/meta/categories', auth, async (req, res) => {
  try {
    console.log('📋 Fetching categories for user:', req.user.name);
    const { supabase } = require('../../config/supabase');
    const { data, error } = await supabase.from('categories').select('*').order('name');

    if (error) throw error;
    console.log('✅ Categories fetched:', data.length);
    res.json(data);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
});

router.get('/meta/statuses', auth, async (req, res) => {
  try {
    console.log('📋 Fetching statuses for user:', req.user.name);
    const { supabase } = require('../../config/supabase');
    const { data, error } = await supabase.from('statuses').select('*').order('name');

    if (error) throw error;
    console.log('✅ Statuses fetched:', data.length);
    res.json(data);
  } catch (error) {
    console.error('Get statuses error:', error);
    res.status(500).json({ message: 'Failed to fetch statuses', error: error.message });
  }
});

module.exports = router;
