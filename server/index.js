const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const commentRoutes = require('./routes/comments');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
const explicitAllowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  process.env.ADDITIONAL_CLIENT_URL || '',
  'http://localhost:3001',
  'http://localhost:3000',
  'http://localhost:5002',
  'http://localhost:5003'
].filter(Boolean);

const allowedPatternMatchers = [
  /https?:\/\/([a-z0-9-]+)\.netlify\.app(:\d+)?$/i, // any Netlify subdomain
  /https?:\/\/([a-z0-9-]+)\.ngrok(-free)?\.app(:\d+)?$/i, // ngrok URLs
  /https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/i // local LAN IPs like http://192.168.x.x:5003
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow server-to-server / curl

    const isExplicit = explicitAllowedOrigins.includes(origin);
    const matchesPattern = allowedPatternMatchers.some((re) => re.test(origin));

    if (isExplicit || matchesPattern) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
}));
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

// Test Supabase connection
const { supabase } = require('../config/supabase');
supabase.from('users').select('count').then(() => {
  console.log('✅ Supabase connected successfully');
}).catch(err => {
  console.log('❌ Supabase connection error:', err.message);
});

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
      user_id: 1, // Use your user ID
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
    
    // Test users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (usersError) {
      console.error('Users table error:', usersError);
      return res.status(500).json({ error: 'Users table error', details: usersError });
    }
    
    // Test categories table
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');
    
    if (categoriesError) {
      console.error('Categories table error:', categoriesError);
      return res.status(500).json({ error: 'Categories table error', details: categoriesError });
    }
    
    // Test tickets table
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Root route for ngrok access
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
    },
    frontend: 'https://frabjous-fairy-9be454.netlify.app'
  });
});

// Serve client build in production for single-port hosting
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  const clientBuildPath = path.join(__dirname, '..', 'client', 'build');
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

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

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Debug endpoint: http://localhost:${PORT}/api/debug/database`);
  console.log(`🔍 Test endpoint: http://localhost:${PORT}/api/test`);
});

module.exports = app;