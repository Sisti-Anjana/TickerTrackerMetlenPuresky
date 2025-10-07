  // Initial data loading
  useEffect(() => {
    console.log('🚀 Dashboard mounted for user:', user?.name);
    if (user) {
      fetchTickets(true);
      fetchStats();
      refreshUser(); // Refresh user data to ensure it's current
    }
  }, [user, fetchTickets, fetchStats, refreshUser]);

  // Refetch when filter changes
  useEffect(() => {
    if (user) {
      fetchTickets(false);
      fetchStats();
    }
  }, [filter]);

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTickets(tickets);
    } else {
      const searchLower = searchTerm.toLowerCase();
      const filtered = tickets.filter(ticket => 
        ticket.ticket_number?.toLowerCase().includes(searchLower) ||
        ticket.customer_name?.toLowerCase().includes(searchLower) ||
        ticket.equipment?.toLowerCase().includes(searchLower) ||
        ticket.category?.toLowerCase().includes(searchLower) ||
        ticket.site_name?.toLowerCase().includes(searchLower) ||
        ticket.issue_description?.toLowerCase().includes(searchLower) ||
        ticket.case_number?.toLowerCase().includes(searchLower) ||
        ticket.users?.name?.toLowerCase().includes(searchLower) ||
        ticket.created_by_name?.toLowerCase().includes(searchLower)
      );
      setFilteredTickets(filtered);
    }
  }, [searchTerm, tickets]);

  // Auto-refresh every 30 seconds when page is active
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden && user) {
        console.log('🔄 Auto-refreshing dashboard data...');
        fetchTickets(false);
        fetchStats();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user, fetchTickets, fetchStats]);

  // Manual refresh handler
  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    await fetchTickets(false);
    await fetchStats();
  };

  // Filter change handler
  const handleFilterChange = (newFilter: 'all' | 'my-tickets') => {
    console.log('🔍 Filter changed to:', newFilter);
    setFilter(newFilter);
    setSearchTerm(''); // Clear search when changing filter
  };
