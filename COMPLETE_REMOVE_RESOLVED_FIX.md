# COMPLETE FIX FOR DASHBOARD.TSX - Remove All "Resolved" References

## Critical Syntax Errors Found:
Your Dashboard.tsx file has broken code where "resolved" appears alone without proper syntax.

## Step-by-Step Manual Fix:

### 1. Remove from DashboardStats Interface (Line ~57)
**Find:**
```typescript
interface DashboardStats {
  total: number;
  open: number;
  closed: number;
  pending: number;
  resolved: number;  // ← DELETE THIS ENTIRE LINE
  production_impacting: number;
```

**Result:**
```typescript
interface DashboardStats {
  total: number;
  open: number;
  closed: number;
  pending: number;
  production_impacting: number;
```

### 2. Remove from useState Initial State (Line ~82)
**Find:**
```typescript
const [stats, setStats] = useState<DashboardStats>({
  total: 0,
  open: 0,
  closed: 0,
  pending: 0,
  resolved: 0,  // ← DELETE THIS ENTIRE LINE
  production_impacting: 0,
```

**Result:**
```typescript
const [stats, setStats] = useState<DashboardStats>({
  total: 0,
  open: 0,
  closed: 0,
  pending: 0,
  production_impacting: 0,
```

### 3. Remove Resolved Case from Switch Statement (Lines ~295-304)
**Find and DELETE the entire block:**
```typescript
case 'resolved':
  console.log('🔍 Before resolved filter - all tickets:', filtered.map(t => ({
    number: t.ticket_number,
    status: t.ticket_status,
    statusLower: t.ticket_status?.toLowerCase()
  })));
  filtered = filtered.filter(ticket => (ticket.ticket_status || ticket.status)?.toLowerCase() === 'resolved');
  console.log(`📊 Resolved filter: ${beforeStatFilter} → ${filtered.length}`);
  console.log('📊 Resolved tickets:', filtered.map(t => ({ number: t.ticket_number, status: t.ticket_status })));
  break;
```

### 4. Remove from Stats Calculation (Line ~455)
**Find:**
```typescript
const currentStats: DashboardStats = {
  total: ticketList.length,
  open: ticketList.filter(t => (t.ticket_status || t.status)?.toLowerCase() === 'open').length,
  pending: ticketList.filter(t => (t.ticket_status || t.status)?.toLowerCase() === 'pending').length,
  closed: ticketList.filter(t => (t.ticket_status || t.status)?.toLowerCase() === 'closed').length,
  resolved: ticketList.filter(t => (t.ticket_status || t.status)?.toLowerCase() === 'resolved').length,  // ← DELETE THIS LINE
  production_impacting: ticketList.filter(t =>
```

**Result:**
```typescript
const currentStats: DashboardStats = {
  total: ticketList.length,
  open: ticketList.filter(t => (t.ticket_status || t.status)?.toLowerCase() === 'open').length,
  pending: ticketList.filter(t => (t.ticket_status || t.status)?.toLowerCase() === 'pending').length,
  closed: ticketList.filter(t => (t.ticket_status || t.status)?.toLowerCase() === 'closed').length,
  production_impacting: ticketList.filter(t =>
```

### 5. Remove Resolved Comments (Line ~547)
**Find and DELETE:**
```typescript
// Ticket Status Options
Resolved  // ← DELETE THIS LINE
```

### 6. Remove from handleStatusChange (Line ~560)
**Find:**
```typescript
// Auto-set timestamps based on status
if (newStatus === 'closed' || newStatus === 'resolved') {  // ← CHANGE TO: if (newStatus === 'closed') {
  updateData.issue_end_time = new Date().toISOString();
  updateData.closed_at = new Date().toISOString();
}
```

**Change to:**
```typescript
// Auto-set timestamps based on status
if (newStatus === 'closed') {
  updateData.issue_end_time = new Date().toISOString();
  updateData.closed_at = new Date().toISOString();
}
```

### 7. Remove from formatDuration (Line ~586-587)
**Find:**
```typescript
// For Closed/Resolved tickets, use closed_at if available; otherwise use endTime
if ((ticketStatus?.toLowerCase() === 'closed' || ticketStatus?.toLowerCase() === 'resolved') && closedAt) {
```

**Change to:**
```typescript
// For Closed tickets, use closed_at if available; otherwise use endTime
if (ticketStatus?.toLowerCase() === 'closed' && closedAt) {
```

### 8. Remove from Status Dropdown (Line ~1168)
**Find:**
```html
<select>
  <option value="open">Open</option>
  <option value="resolved">Resolved</option>  <!-- DELETE THIS LINE -->
  <option value="pending">Pending</option>
  <option value="closed">Closed</option>
</select>
```

**Result:**
```html
<select>
  <option value="open">Open</option>
  <option value="pending">Pending</option>
  <option value="closed">Closed</option>
</select>
```

### 9. Remove from Closed Date Display (Line ~1176)
**Find:**
```typescript
{(ticket.ticket_status === 'closed' || ticket.ticket_status === 'resolved') && ticket.closed_at && (
```

**Change to:**
```typescript
{ticket.ticket_status === 'closed' && ticket.closed_at && (
```

### 10. Remove Resolved Stats Card (Find around line 800-815)
**Find and DELETE entire block:**
```jsx
<div 
  className={`stat-card resolved ${activeStatFilter === 'resolved' ? 'active' : ''}`}
  onClick={() => handleStatCardClick('resolved')}
>
  <div className="stat-icon">✅</div>
  <div className="stat-content">
    <div className="stat-number">{stats.resolved || 0}</div>
    <div className="stat-label">Resolved</div>
  </div>
</div>
```

## Database Cleanup:

Run in Supabase SQL Editor:
```sql
-- Convert all Resolved tickets to Closed
UPDATE tickets 
SET ticket_status = 'Closed' 
WHERE ticket_status = 'Resolved';

-- Remove Resolved status
DELETE FROM statuses WHERE name = 'Resolved';
```

## Final Result:

Your system will only have:
- **Open** - Active tickets
- **Pending** - Waiting tickets  
- **Closed** - Completed tickets (with closed_at timestamp)

All "Resolved" references removed from the entire system!
