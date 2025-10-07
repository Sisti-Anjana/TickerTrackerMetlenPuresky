# COMPLETE IMPLEMENTATION SCRIPT
# This script will update all your files to implement the user data and ticket requirements

echo "🚀 Starting User Data & Ticket Implementation..."
echo "=============================================="

# Step 1: Update AuthContext for better user data handling
echo "📝 Step 1: Updating AuthContext..."
cp "IMPLEMENTATION_UPDATES/Enhanced_AuthContext.tsx" "../client/src/contexts/AuthContext.tsx"
echo "✅ AuthContext updated with enhanced user data handling"

# Step 2: Update tickets route with enhanced functionality
echo "📝 Step 2: Creating enhanced tickets route..."
cat > "../server/routes/tickets.js" << 'EOF'
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
EOF

# Add the rest of the tickets route
cat "IMPLEMENTATION_UPDATES/Enhanced_Tickets_Route_Part2.js" >> "../server/routes/tickets.js"
cat "IMPLEMENTATION_UPDATES/Enhanced_Tickets_Route_Part3.js" >> "../server/routes/tickets.js"

echo "✅ Tickets route updated with enhanced functionality"

# Step 3: Update Dashboard with real-time data
echo "📝 Step 3: Creating enhanced dashboard..."
cat > "../client/src/pages/Dashboard.tsx" << 'EOF'
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import '../styles/dashboard.css';

interface Ticket {
  id: string;
  ticket_number?: string;
  user_id?: number;
  customer_name?: string;
  customer_type?: string;
  asset_name?: string;
  site_name?: string;
  equipment?: string;
  category?: string;
  site_outage?: string;
  ticket_status?: string;
  issue_start_time?: string;
  issue_end_time?: string;
  total_duration?: string;
  kw_down?: number;
  case_number?: string;
  issue_description?: string;
  additional_notes?: string;
  priority?: string;
  created_at: string;
  users?: {
    name: string;
    email: string;
    created_at?: string;
  };
  created_by_name?: string;
  created_by_email?: string;
  is_owner?: boolean;
}

interface DashboardStats {
  total: number;
  open: number;
  closed: number;
  pending: number;
  production_impacting: number;
  communication_issues: number;
  cannot_confirm: number;
  today: number;
  this_week: number;
  this_month: number;
  filter: string;
  user: string;
  last_updated: string;
}
EOF

# Combine all dashboard parts
cat "IMPLEMENTATION_UPDATES/Enhanced_Dashboard_Part2.tsx" >> "../client/src/pages/Dashboard.tsx"
cat "IMPLEMENTATION_UPDATES/Enhanced_Dashboard_Part3.tsx" >> "../client/src/pages/Dashboard.tsx"
cat "IMPLEMENTATION_UPDATES/Enhanced_Dashboard_Part4.tsx" >> "../client/src/pages/Dashboard.tsx"
cat "IMPLEMENTATION_UPDATES/Enhanced_Dashboard_Part5.tsx" >> "../client/src/pages/Dashboard.tsx"
cat "IMPLEMENTATION_UPDATES/Enhanced_Dashboard_Part6.tsx" >> "../client/src/pages/Dashboard.tsx"
cat "IMPLEMENTATION_UPDATES/Enhanced_Dashboard_Part7.tsx" >> "../client/src/pages/Dashboard.tsx"
cat "IMPLEMENTATION_UPDATES/Enhanced_Dashboard_Part8.tsx" >> "../client/src/pages/Dashboard.tsx"

echo "✅ Dashboard updated with real-time data and user filtering"

# Step 4: Update CreateTicket component
echo "📝 Step 4: Updating CreateTicket component..."
cp "IMPLEMENTATION_UPDATES/Enhanced_CreateTicket.tsx" "../client/src/pages/CreateTicket.tsx"
echo "✅ CreateTicket component updated with enhanced functionality"

echo ""
echo "🎉 IMPLEMENTATION COMPLETE!"
echo "=========================="
echo ""
echo "✅ User data is now properly saved and associated with tickets"
echo "✅ Tickets are created with proper user relationships"
echo "✅ Dashboard shows real tickets with user information"
echo "✅ No dummy data - everything is from the database"
echo "✅ Real-time updates when creating new tickets"
echo "✅ Enhanced filtering and search capabilities"
echo ""
echo "🔄 Next steps:"
echo "1. Run the database cleanup script if needed"
echo "2. Restart your server: npm run dev (in server folder)"
echo "3. Restart your client: npm start (in client folder)"
echo "4. Test the new functionality"
echo ""
echo "📊 Features implemented:"
echo "- User authentication with proper data storage"
echo "- Ticket creation with user association"
echo "- Real-time dashboard updates"
echo "- User filtering (My Tickets vs All Tickets)"
echo "- Enhanced search and filtering"
echo "- Auto-refresh functionality"
echo "- Better error handling and loading states"
