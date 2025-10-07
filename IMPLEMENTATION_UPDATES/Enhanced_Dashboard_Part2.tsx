const Dashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    open: 0,
    closed: 0,
    pending: 0,
    production_impacting: 0,
    communication_issues: 0,
    cannot_confirm: 0,
    today: 0,
    this_week: 0,
    this_month: 0,
    filter: 'all',
    user: user?.name || '',
    last_updated: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'my-tickets'>('all');
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Enhanced ticket fetching with filters
  const fetchTickets = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);
      
      setError('');
      console.log('🎫 Fetching tickets with filter:', filter);
      console.log('👤 Current user:', user?.name);
      
      const params = filter === 'my-tickets' ? { filter: 'my-tickets' } : {};
      const response = await api.get('/tickets', { params });
      
      console.log('📊 Tickets response:', response.data);
      
      if (response.data?.tickets) {
        const ticketsData = response.data.tickets;
        setTickets(ticketsData);
        setFilteredTickets(ticketsData);
        setLastUpdate(new Date());
        
        console.log(`✅ Loaded ${ticketsData.length} tickets`);
        console.log('📊 Sample ticket:', ticketsData[0] ? {
          id: ticketsData[0].id,
          ticket_number: ticketsData[0].ticket_number,
          customer_name: ticketsData[0].customer_name,
          created_by: ticketsData[0].users?.name || ticketsData[0].created_by_name
        } : 'No tickets');
      } else {
        console.log('📭 No tickets found');
        setTickets([]);
        setFilteredTickets([]);
      }
    } catch (error: any) {
      console.error('❌ Error fetching tickets:', error);
      setError(`Failed to load tickets: ${error.response?.data?.message || error.message}`);
      setTickets([]);
      setFilteredTickets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, user]);

  // Enhanced stats fetching
  const fetchStats = useCallback(async () => {
    try {
      console.log('📊 Fetching stats with filter:', filter);
      const params = filter === 'my-tickets' ? { filter: 'my-tickets' } : {};
      const response = await api.get('/tickets/meta/stats', { params });
      
      console.log('📈 Stats response:', response.data);
      setStats(response.data);
    } catch (error: any) {
      console.error('❌ Error fetching stats:', error);
      // Don't show error for stats, just use current values
    }
  }, [filter]);
