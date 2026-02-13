const { createClient } = require('@supabase/supabase-js');

const url = 'https://tlnojwnrvvrnujnhdlrr.supabase.co';
// Using the service role key from the check_schema_v2.js file
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsbm9qd25ydnZybnVqbmhkbHJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUyMzA4OCwiZXhwIjoyMDc1MDk5MDg4fQ.pIqe8K3l5k6PKAMLgS1boUDxYL7Ts33u9ZRfsjuH-Bg';
const supabase = createClient(url, key);

async function testCreateTicket() {
    console.log('--- Testing Create Ticket with Null issue_end_time ---');

    // 1. Get a valid user
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('id')
        .limit(1);

    if (userError || !users || users.length === 0) {
        console.error('Failed to get a user:', userError);
        return;
    }

    const userId = users[0].id;
    console.log('Using User ID:', userId);

    // 2. Try to create a ticket with null end_time
    const ticketData = {
        user_id: userId,
        customer_name: 'Test User',
        customer_type: 'Puresky',
        asset_name: 'Asset 1',
        site_name: 'Test Site',
        equipment: 'Inverter',
        category: 'Production Impacting',
        issue_start_time: new Date().toISOString(),
        issue_end_time: null, // This is what we want to test
        issue_description: 'Test null end time',
        priority: 'Medium',
        ticket_status: 'Open',
        site_outage: 'No'
    };

    const { data, error } = await supabase
        .from('tickets')
        .insert([ticketData])
        .select();

    if (error) {
        console.error('❌ Insert Error:', error);
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
        console.error('Error Details:', error.details);
    } else {
        console.log('✅ Ticket created successfully:', data);
    }
}

testCreateTicket();
