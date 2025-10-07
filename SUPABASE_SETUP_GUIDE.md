# PERFECT SUPABASE SETUP GUIDE

## 🎯 GOAL: Perfect Connection & Functionality

This guide ensures your user login and ticket creation work flawlessly with Supabase.

## Step 1: Run the Perfect Schema

1. **Copy the entire content** of `PERFECT_SUPABASE_SCHEMA.sql`
2. **Open Supabase Dashboard** → Your Project → SQL Editor
3. **Paste the entire script** and click "Run"
4. **Wait for completion** - you should see success messages

The script will:
- ✅ Drop and recreate all tables with perfect structure
- ✅ Set up Row Level Security (RLS) policies
- ✅ Create auto-increment ticket numbers (AGS1, AGS2, etc.)
- ✅ Auto-calculate duration between start/end times
- ✅ Insert your 3 categories and 3 statuses
- ✅ Create performance indexes
- ✅ Set up search functionality

## Step 2: Verify Schema Setup

After running the schema, you should see this output in Supabase SQL Editor:

```
✅ Tables created: 5 of 5
✅ Categories inserted: 3
✅ Statuses inserted: 3
✅ Functions created: 4
✅ Triggers created: 6+
✅ Indexes created: 10+
🎉 PERFECT! Your database is ready for production!
```

## Step 3: Test Database Connection

Run this test to verify your server can connect to Supabase:

```bash
# In your project directory
cd "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\TAnj - claud"

# Test the connection
node -e "
const { testSupabaseConnection, getDatabaseStats } = require('./config/supabase');
testSupabaseConnection().then(async (success) => {
  if (success) {
    const stats = await getDatabaseStats();
    console.log('Database Stats:', stats);
    console.log('🎉 Connection test PASSED!');
  } else {
    console.log('❌ Connection test FAILED!');
  }
  process.exit(0);
});
"
```

## Step 4: Start Your Server and Test

```bash
# Start your server
npm run server
```

You should see in the logs:
- `✅ Supabase connected successfully!`
- `🚀 Supabase module loaded successfully!`
- `Server running on port 5001`

## Step 5: Test User Registration

**Using PowerShell:**
```powershell
$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5001/api/auth/register" -Method POST -Headers $headers -Body $body
```

**Expected Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJ...",
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

## Step 6: Test User Login

```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5001/api/auth/login" -Method POST -Headers $headers -Body $body
```

## Step 7: Test Ticket Creation

```powershell
# Replace YOUR_TOKEN with the token from login response
$authHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer YOUR_TOKEN"
}

$ticketBody = @{
    customer_name = "Test Customer"
    customer_type = "Puresky"
    site_name = "Site 1"
    equipment = "Production Meter"
    category = "Production Impacting"
    site_outage = "No"
    issue_start_time = "2024-01-15T10:00:00Z"
    issue_end_time = "2024-01-15T12:00:00Z"
    issue_description = "Test ticket description"
    kw_down = 100.5
    case_number = "CASE123"
    additional_notes = "Additional test notes"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5001/api/tickets" -Method POST -Headers $authHeaders -Body $ticketBody
```

**Expected Response:**
```json
{
  "id": 1,
  "ticket_number": "AGS1",
  "customer_name": "Test Customer",
  "equipment": "Production Meter",
  "category": "Production Impacting",
  "total_duration": "2h 0m",
  "message": "Ticket AGS1 created successfully!"
}
```

## Step 8: Verify in Supabase Dashboard

1. Go to **Supabase Dashboard** → **Table Editor**
2. Check the **tickets** table - you should see your test ticket
3. Check the **users** table - you should see your test user
4. Verify the ticket has:
   - ✅ Auto-generated ticket number (AGS1)
   - ✅ Auto-calculated duration (2h 0m)
   - ✅ All your form fields properly saved

## Step 9: Test Dashboard Functionality

```powershell
# Get all tickets
Invoke-RestMethod -Uri "http://localhost:5001/api/tickets" -Method GET -Headers $authHeaders

# Get ticket statistics
Invoke-RestMethod -Uri "http://localhost:5001/api/tickets/meta/stats" -Method GET -Headers $authHeaders

# Search tickets
Invoke-RestMethod -Uri "http://localhost:5001/api/tickets/search/AGS1" -Method GET -Headers $authHeaders
```

## 🎯 What Your Form Fields Map To:

| Frontend Form Field | Database Column | Auto-Generated |
|-------------------|----------------|----------------|
| customerName | customer_name | ❌ |
| customerType | customer_type | ❌ |
| siteName | site_name | ❌ |
| equipment | equipment | ❌ |
| category | category | ❌ |
| siteOutage | site_outage | ❌ |
| ticketStatus | ticket_status | ❌ |
| issueStartTime | issue_start_time | ❌ |
| issueEndTime | issue_end_time | ❌ |
| kwDown | kw_down | ❌ |
| caseNumber | case_number | ❌ |
| issueDescription | issue_description | ❌ |
| additionalNotes | additional_notes | ❌ |
| (auto) | ticket_number | ✅ AGS1, AGS2, etc. |
| (auto) | total_duration | ✅ Calculated from start/end |
| (auto) | user_id | ✅ From JWT token |

## 🔧 Troubleshooting:

**If registration fails:**
- Check server logs for detailed error messages
- Verify Supabase credentials in `.env` file
- Make sure schema was applied successfully

**If ticket creation fails:**
- Verify you're sending the JWT token in Authorization header
- Check that all required fields are included
- Look for validation errors in server logs

**If dashboard doesn't show tickets:**
- Verify tickets were actually saved to database
- Check RLS policies are working correctly
- Test the API endpoints directly first

## 🎉 Success Indicators:

- ✅ Schema setup shows all green checkmarks
- ✅ Server logs show successful Supabase connection
- ✅ User registration/login works via API
- ✅ Ticket creation returns AGS numbers
- ✅ Tickets appear in Supabase table editor
- ✅ Dashboard shows created tickets
- ✅ All form fields are properly saved

Your system should now work perfectly with Supabase!