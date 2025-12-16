const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('../server/routes/auth');
const ticketRoutes = require('../server/routes/tickets');
const commentRoutes = require('../server/routes/comments');
const adminRoutes = require('../server/routes/admin');
const equipmentRoutes = require('../server/routes/equipment');

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle OPTIONS requests for CORS preflight
app.options('*', cors());

app.use(express.json());

// Enhanced logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  if (req.headers.authorization) {
    console.log('Auth header present:', req.headers.authorization.substring(0, 20) + '...');
  }
  next();
});

// Test Supabase connection (non-blocking)
const { supabase } = require('../config/supabase');
if (supabase) {
  supabase.from('users').select('count').limit(1).then(() => {
    console.log('✅ Supabase connected successfully');
  }).catch(err => {
    console.log('❌ Supabase connection error:', err.message);
  });
} else {
  console.warn('⚠️ Supabase not initialized - check environment variables');
}

// Test endpoint for debugging
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Debug endpoint for testing authentication and database
app.post('/api/debug/create-ticket', async (req, res) => {
  try {
    console.log('=== DEBUG TICKET CREATION ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    // Skip auth for debugging
    const testTicketData = {
      user_id: 1,
      customer_name: 'Debug Test',
      customer_type: 'Puresky',
      asset_name: 'Asset 1',
      site_name: 'Debug Site',
      equipment: 'Test Equipment',
      category: 'Production Impacting',
      site_outage: 'No',
      ticket_status: 'Open',
      issue_start_time: '2024-01-01T10:00:00',
      issue_end_time: '2024-01-01T12:00:00',
      issue_description: 'Debug test ticket',
      priority: 'Medium'
    };

    const { data: newTicket, error } = await supabase
      .from('tickets')
      .insert([testTicketData])
      .select('*')
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: error.message, details: error });
    }

    console.log('Ticket created:', newTicket);
    res.json({ success: true, ticket: newTicket });
    
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// Debug endpoint for testing database
app.get('/api/debug/database', async (req, res) => {
  try {
    console.log('=== DATABASE DEBUG TEST ===');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (usersError) {
      console.error('Users table error:', usersError);
      return res.status(500).json({ error: 'Users table error', details: usersError });
    }
    
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');
    
    if (categoriesError) {
      console.error('Categories table error:', categoriesError);
      return res.status(500).json({ error: 'Categories table error', details: categoriesError });
    }
    
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('*')
      .limit(5);
    
    if (ticketsError) {
      console.error('Tickets table error:', ticketsError);
      return res.status(500).json({ error: 'Tickets table error', details: ticketsError });
    }
    
    console.log('✅ Database debug test successful');
    res.json({
      message: 'Database connection successful',
      stats: {
        users: users.length,
        categories: categories.length,
        tickets: tickets.length
      },
      sampleData: {
        users: users.map(u => ({ id: u.id, name: u.name, email: u.email })),
        categories: categories,
        tickets: tickets.map(t => ({ id: t.id, ticket_number: t.ticket_number, customer_name: t.customer_name }))
      }
    });
  } catch (error) {
    console.error('=== DATABASE DEBUG ERROR ===');
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Database debug failed', 
      message: error.message,
      stack: error.stack
    });
  }
});

// Routes - Vercel strips /api prefix, so routes should not include it
// But we'll handle both cases for compatibility
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/tickets', ticketRoutes);
app.use('/api/comments', commentRoutes);
app.use('/comments', commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/equipment', equipmentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Ticket Management System Backend',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      test: '/api/test',
      auth: '/api/auth/*',
      tickets: '/api/tickets/*',
      comments: '/api/comments/*'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('=== GLOBAL ERROR HANDLER ===');
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  res.status(500).json({ 
    message: 'Internal server error',
    error: err.message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Export for Vercel serverless function
// Vercel's @vercel/node adapter handles Express apps directly
// The rewrite rule sends /api/* to this function, and Vercel strips /api
// So we need to handle routes both with and without /api prefix
module.exports = app;

