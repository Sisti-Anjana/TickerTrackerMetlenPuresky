# SQL Schema Alignment Summary

## ✅ Your Current Schema Analysis

### Perfect Matches (No Changes Needed):
1. ✅ **Statuses**: 'Open', 'Closed', 'Pending' (Already correct - no "Resolved"!)
2. ✅ **customer_name** → Frontend displays as "Creator Name"
3. ✅ **customer_type** → Frontend displays as "Client Type"
4. ✅ **site_name** → Maps to "Site Name" column
5. ✅ **equipment** → Maps to "Equipment" column
6. ✅ **category** → Maps to "Category" column
7. ✅ **ticket_status** → Maps to "Status" column
8. ✅ **site_outage** → Maps to "Outage" column
9. ✅ **kw_down** → Maps to "KW Down" column
10. ✅ **created_at** → Maps to "Created Date" column
11. ✅ **user relationship** → Maps to "Creator Name" column (via JOIN with users table)

### ⚠️ Required Addition:
1. **closed_at field** - Need to add this to track when tickets are closed

## 🔧 Steps to Update Your Database:

### Step 1: Run the ADD_CLOSED_AT_FIELD.sql script
This will:
- Add the `closed_at` column to tickets table
- Create an index for performance
- Set up auto-trigger to populate closed_at when status changes to 'Closed'
- Backfill existing closed tickets with their updated_at timestamp

### Step 2: Verify Backend API
Make sure your backend API returns these fields in the correct format:

```javascript
// GET /tickets response should include:
{
  id: number,
  ticket_number: string,
  customer_name: string,          // Displayed as "Creator Name"
  customer_type: string,          // Displayed as "Client Type"  
  site_name: string,
  equipment: string,
  category: string,
  ticket_status: string,          // Only: 'Open', 'Pending', 'Closed'
  site_outage: string,            // 'Yes' or 'No'
  issue_start_time: timestamp,
  issue_end_time: timestamp,
  total_duration: string,
  kw_down: decimal,
  created_at: timestamp,
  closed_at: timestamp | null,    // NEW FIELD
  users: {
    name: string,                 // For "Creator Name" column
    email: string
  }
}
```

## 📊 Dashboard Table Column Mapping:

| Dashboard Column | Database Field | Source |
|-----------------|---------------|--------|
| Ticket # | ticket_number | tickets.ticket_number |
| Client Type | customer_type | tickets.customer_type |
| Site Name | site_name | tickets.site_name |
| Equipment | equipment | tickets.equipment |
| Category | category | tickets.category |
| Status | ticket_status | tickets.ticket_status |
| Outage | site_outage | tickets.site_outage |
| Duration | calculated | Calculate from issue_start_time, issue_end_time, closed_at |
| KW Down | kw_down | tickets.kw_down |
| Creator Name | users.name | JOIN tickets.user_id = users.id |
| Created Date | created_at | tickets.created_at |
| Actions | - | Frontend component (View button, Status dropdown) |

## 🎯 Backend Query Example:

Your backend should fetch tickets with this query structure:

```sql
SELECT 
  t.id,
  t.ticket_number,
  t.customer_name,
  t.customer_type,
  t.site_name,
  t.equipment,
  t.category,
  t.ticket_status,
  t.site_outage,
  t.issue_start_time,
  t.issue_end_time,
  t.total_duration,
  t.kw_down,
  t.case_number,
  t.issue_description,
  t.additional_notes,
  t.priority,
  t.created_at,
  t.closed_at,              -- NEW FIELD
  u.id as user_id,
  u.name as created_by_name,
  u.email as created_by_email
FROM tickets t
LEFT JOIN users u ON t.user_id = u.id
ORDER BY t.created_at DESC;
```

## ✅ Checklist:

- [ ] Run ADD_CLOSED_AT_FIELD.sql in Supabase
- [ ] Verify closed_at column exists in tickets table
- [ ] Update backend API to include closed_at in responses
- [ ] Test creating a new ticket
- [ ] Test changing ticket status to 'Closed' (should auto-set closed_at)
- [ ] Test changing status from 'Closed' to 'Open' (should clear closed_at)
- [ ] Verify Dashboard table shows all 12 columns correctly
- [ ] Test filtering by status (Open, Pending, Closed only)

## 🚀 You're Almost Done!

Your schema is 95% perfect! Just add the `closed_at` field and you're good to go.
