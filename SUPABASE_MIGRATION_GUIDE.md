# Supabase Migration Guide

This guide will help you migrate your ticket tracking application from MongoDB to Supabase.

## Prerequisites

1. Supabase project set up with the provided credentials
2. Node.js and npm installed
3. All dependencies installed (`npm run install-all`)

## Database Setup

### Step 1: Run Database Migrations

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/efzxlqdlnxopxwhwiopc
2. Navigate to the SQL Editor
3. Run the migration scripts in order:

#### First, run `migrations/01_create_tables.sql`:
```sql
-- This creates all the necessary tables based on your ERD
-- Run this script in the Supabase SQL Editor
```

#### Then, run `migrations/02_setup_rls.sql`:
```sql
-- This sets up Row Level Security policies
-- Run this script in the Supabase SQL Editor
```

### Step 2: Verify Database Structure

After running the migrations, verify that you have the following tables:
- `users` - User accounts
- `tickets` - Main ticket records
- `categories` - Ticket categories (Bug, Feature, Support, Other)
- `statuses` - Ticket statuses (Open, In Progress, Resolved, Closed)
- `comments` - Ticket comments

## Environment Configuration

### Server Environment Variables

Create a `.env` file in the root directory with:

```env
# Supabase Configuration
SUPABASE_URL=https://khrphraziwrdemfhqyjv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmenhscWRsbnhvcHh3aHdpb3BjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU3MDQsImV4cCI6MjA3Mzg4MTcwNH0.n95CuwcxdzI01CrXrnOUO1oDe2caS7DzcTVLRepB0Xc
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmenhscWRsbnhvcHh3aHdpb3BjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODMwNTcwNCwiZXhwIjoyMDczODgxNzA0fQ.lD6zN_LSL-M4YFhEU4n3zXGgtJ8jE49m15zHJm-EqmY

# Server Configuration
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
```

### Client Environment Variables

Create a `.env` file in the `client` directory with:

```env
# Supabase Configuration for Client
REACT_APP_SUPABASE_URL=https://efzxlqdlnxopxwhwiopc.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmenhscWRsbnhvcHh3aHdpb3BjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU3MDQsImV4cCI6MjA3Mzg4MTcwNH0.n95CuwcxdzI01CrXrnOUO1oDe2caS7DzcTVLRepB0Xc

# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
```

## Running the Application

### Development Mode

1. Start the server:
```bash
npm run server
```

2. In a new terminal, start the client:
```bash
npm run client
```

3. Or run both simultaneously:
```bash
npm run dev
```

### Production Build

1. Build the client:
```bash
npm run build
```

2. Start the server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Tickets
- `GET /api/tickets` - Get all tickets (with pagination and filters)
- `GET /api/tickets/:id` - Get single ticket
- `POST /api/tickets` - Create new ticket
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket
- `GET /api/tickets/meta/categories` - Get all categories
- `GET /api/tickets/meta/statuses` - Get all statuses
- `GET /api/tickets/meta/stats` - Get ticket statistics

### Comments
- `GET /api/comments/ticket/:ticketId` - Get comments for a ticket
- `POST /api/comments` - Create new comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

## Data Structure

### Ticket Fields (matching your ERD)
- `ticket_number` - Auto-generated unique ticket number (e.g., AGS0001)
- `user_id` - Foreign key to users table
- `company` - Company name
- `site` - Site location
- `equipment` - Equipment name/model
- `category_id` - Foreign key to categories table
- `status_id` - Foreign key to statuses table
- `outage` - Type of outage
- `issue_start` - Issue start timestamp
- `issue_end` - Issue end timestamp
- `kw_down` - Kilowatts down (numeric)
- `case_number` - Case number
- `description` - Detailed description
- `additional_notes` - Additional notes
- `created_at` - Creation timestamp

## Troubleshooting

### Common Issues

1. **Connection Error**: Verify your Supabase URL and keys are correct
2. **RLS Policy Error**: Make sure you've run the RLS setup script
3. **Missing Tables**: Ensure you've run the table creation script
4. **Authentication Issues**: Check that JWT_SECRET is set in your environment

### Testing the Migration

1. Try creating a new user account
2. Create a new ticket with all fields
3. Add comments to the ticket
4. Update ticket status and other fields
5. Verify data appears correctly in Supabase dashboard

## Security Notes

- The service role key has full database access - keep it secure
- The anon key is safe to use in client-side code
- RLS policies control data access at the database level
- JWT tokens are used for API authentication

## Next Steps

1. Test all functionality thoroughly
2. Consider adding more RLS policies if needed
3. Set up database backups in Supabase
4. Monitor performance and optimize queries if necessary
5. Consider adding real-time subscriptions for live updates
