    
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
      is_owner: ticket.user_id === parseInt(req.user.id)
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

// Delete ticket (only by owner)
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('=== DELETE TICKET REQUEST ===');
    console.log('Ticket ID:', req.params.id);
    console.log('User:', req.user);
    
    const { supabase } = require('../../config/supabase');
    
    // First check if ticket exists and user owns it
    const { data: ticket, error: fetchError } = await supabase
      .from('tickets')
      .select('id, ticket_number, user_id')
      .eq('id', req.params.id)
      .single();
    
    if (fetchError || !ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    if (ticket.user_id !== parseInt(req.user.id)) {
      return res.status(403).json({ message: 'You can only delete your own tickets' });
    }
    
    // Delete the ticket
    const { error: deleteError } = await supabase
      .from('tickets')
      .delete()
      .eq('id', req.params.id);
    
    if (deleteError) {
      console.error('Delete error:', deleteError);
      return res.status(500).json({ message: 'Failed to delete ticket' });
    }
    
    console.log('✅ Ticket deleted:', ticket.ticket_number);
    res.json({ 
      message: `Ticket ${ticket.ticket_number} deleted successfully`,
      deleted_ticket: ticket.ticket_number
    });
    
  } catch (error) {
    console.error('=== DELETE TICKET ERROR ===');
    console.error('Error details:', error);
    res.status(500).json({ 
      message: 'Server error deleting ticket', 
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
