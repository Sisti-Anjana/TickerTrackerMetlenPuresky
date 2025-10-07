# IMMEDIATE FIX FOR STATUS DROPDOWN

## Problem: 
Status dropdown in ticket detail page is stuck on "Open" and can't be changed to other options.

## Root Cause:
The TicketDetail page still uses old status handling logic that maps to status_id instead of direct status strings.

## Quick Fix - Update TicketDetail Status Handler:

Find this section in `TicketDetail.tsx` around line 114-130:

```javascript
const handleStatusChange = async (newStatus: string) => {
  try {
    console.log('Changing status to:', newStatus);
    
    // Map status string to status_id
    const statusMap: { [key: string]: number } = {
      'open': 1,
      'in-progress': 2, 
      'resolved': 3,
      'closed': 4
    };
    
    const statusId = statusMap[newStatus];
    if (!statusId) {
      setError('Invalid status selected');
      return;
    }
    
    console.log('Sending status_id:', statusId);
    const response = await api.put(`/tickets/${id}`, { status_id: statusId });
```

**Replace with:**

```javascript
const handleStatusChange = async (newStatus: string) => {
  try {
    console.log('Changing status to:', newStatus);
    
    const updateData: any = {
      ticket_status: newStatus
    };

    // Auto-set timestamps based on status
    if (newStatus === 'closed' || newStatus === 'resolved') {
      updateData.issue_end_time = new Date().toISOString();
      updateData.closed_at = new Date().toISOString();
    }
    
    const response = await api.put(`/tickets/${id}`, updateData);
```

## Alternative Quick Test:

1. Go to the dashboard instead of ticket detail
2. Try changing status from the dashboard dropdown
3. The dashboard dropdown should work correctly

## For Login Page Access:

Run in browser console:
```javascript
localStorage.clear();
window.location.href = '/login';
```

The dashboard status dropdown should work, but the ticket detail page needs the above fix to work properly.
