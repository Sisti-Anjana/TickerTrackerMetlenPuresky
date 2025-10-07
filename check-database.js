const { supabase } = require('./config/supabase');

async function checkDatabase() {
  console.log('🔍 CHECKING DATABASE CONTENTS...');
  console.log('================================');
  
  try {
    // Check users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, created_at')
      .order('created_at', { ascending: false });
    
    if (usersError) {
      console.error('❌ Users table error:', usersError);
    } else {
      console.log(`\n👥 USERS (${users.length} total):`);
      users.forEach(user => {
        console.log(`  • ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`);
      });
    }
    
    // Check tickets
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select(`
        id, 
        ticket_number, 
        customer_name, 
        equipment, 
        category, 
        ticket_status,
        user_id,
        created_at,
        users:user_id(name, email)
      `)
      .order('created_at', { ascending: false });
    
    if (ticketsError) {
      console.error('❌ Tickets table error:', ticketsError);
    } else {
      console.log(`\n🎫 TICKETS (${tickets.length} total):`);
      if (tickets.length === 0) {
        console.log('  📭 No tickets found in database');
        console.log('  💡 This is why your dashboard is empty!');
        console.log('  ➡️  Create a ticket to see data on the dashboard');
      } else {
        tickets.forEach(ticket => {
          console.log(`  • ${ticket.ticket_number}: ${ticket.customer_name} - ${ticket.equipment}`);
          console.log(`    Status: ${ticket.ticket_status}, Created by: ${ticket.users?.name} (ID: ${ticket.user_id})`);
        });
      }
    }
    
    // Check categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*');
      
    if (!catError) {
      console.log(`\n📋 CATEGORIES (${categories.length} total):`);
      categories.forEach(cat => console.log(`  • ${cat.name}`));
    }
    
    // Check statuses
    const { data: statuses, error: statusError } = await supabase
      .from('statuses')
      .select('*');
      
    if (!statusError) {
      console.log(`\n📊 STATUSES (${statuses.length} total):`);
      statuses.forEach(status => console.log(`  • ${status.name}`));
    }
    
    console.log('\n================================');
    console.log('🎯 SUMMARY:');
    console.log(`   Users: ${users?.length || 0}`);
    console.log(`   Tickets: ${tickets?.length || 0}`);
    console.log(`   Categories: ${categories?.length || 0}`);
    console.log(`   Statuses: ${statuses?.length || 0}`);
    
    if ((tickets?.length || 0) === 0) {
      console.log('\n💡 SOLUTION:');
      console.log('   Your dashboard is empty because there are no tickets!');
      console.log('   1. Go to "Create New Ticket" in your app');
      console.log('   2. Fill out the form and submit');
      console.log('   3. The ticket will appear on the dashboard immediately');
      console.log('   4. Dashboard will stop blinking once it has data to display');
    }
    
  } catch (error) {
    console.error('❌ Database connection error:', error);
  }
  
  process.exit(0);
}

checkDatabase();
