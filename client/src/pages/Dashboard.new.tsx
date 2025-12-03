import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import {
  getStatusBadge,
  getStatusIcon,
  getPriorityBadge,
  getPriorityIcon,
  getCategoryBadge,
  getCategoryIcon,
  getOutageBadge,
  formatDate
} from '../utils/badgeUtils';
import '../styles/dashboard-table.css';
import '../styles/advanced-filters.css';
import '../styles/enhanced-sidebar.css';

interface Ticket {
  id: string;
  ticket_number?: string;
  user_id?: number;
  customer_name?: string;
  customer_type?: string;
  asset_name?: string;
  site_name?: string;
  equipment?: string;
  category?: string;
  site_outage?: string;
  ticket_status?: string;
  status?: string;
  issue_start_time?: string;
  issue_end_time?: string;
  total_duration?: string;
  kw_down?: number;
  case_number?: string;
  issue_description?: string;
  additional_notes?: string;
  priority?: string;
  created_at: string;
  closed_at?: string;
  users?: {
    name: string;
    email: string;
    created_at?: string;
  };
  created_by_name?: string;
  created_by_email?: string;
  is_owner?: boolean;
}

interface DashboardStats {
  total: number;
  open: number;
  closed: number;
  pending: number;
  resolved: number;
  production_impacting: number;
  communication_issues: number;
  cannot_confirm: number;
  today: number;
  this_week: number;
  this_month: number;
  filter: string;
  user: string;
  last_updated: string;
}

const Dashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    open: 0,
    closed: 0,
    pending: 0,
    resolved: 0,
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
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' });
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeStatFilter, setActiveStatFilter] = useState('');

  // Fetch tickets with proper error handling and logging
  const fetchTickets = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);
    
    try {
      const response = await api.get('/tickets');
      if (response.data?.tickets) {
        let ticketsData = response.data.tickets;
        
        // Apply My Tickets filter if needed
        if (filter === 'my-tickets' && user) {
          ticketsData = ticketsData.filter((ticket: Ticket) => 
            ticket.user_id === Number(user.id) || 
            ticket.created_by_name === user.name ||
            ticket.created_by_email === user.email
          );
        }
        
        setTickets(ticketsData);
        setFilteredTickets(ticketsData);
        setLastUpdate(new Date());
      }
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
      setError(`Failed to load tickets: ${error.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, user]);

  // Fetch dashboard statistics
  const fetchStats = useCallback(async () => {
    try {
      const params = filter === 'my-tickets' ? { filter: 'my-tickets' } : {};
      const response = await api.get('/tickets/meta/stats', { params });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [filter]);

  // Initial data loading
  useEffect(() => {
    if (user) {
      fetchTickets(true);
      fetchStats();
      refreshUser();
    }
  }, [user?.id, fetchTickets, fetchStats, refreshUser]);

  // Handle search and filtering
  useEffect(() => {
    let filtered = [...tickets];
    
    // Apply search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(ticket => 
        (ticket.ticket_number?.toLowerCase().includes(searchLower) ||
         ticket.customer_name?.toLowerCase().includes(searchLower) ||
         ticket.equipment?.toLowerCase().includes(searchLower) ||
         ticket.site_name?.toLowerCase().includes(searchLower) ||
         ticket.issue_description?.toLowerCase().includes(searchLower) ||
         ticket.case_number?.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(ticket => 
        ticket.ticket_status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Apply priority filter
    if (priorityFilter) {
      filtered = filtered.filter(ticket => 
        ticket.priority?.toLowerCase() === priorityFilter.toLowerCase()
      );
    }
    
    // Apply date filter
    if (dateFilter.startDate) {
      const startDate = new Date(dateFilter.startDate);
      filtered = filtered.filter(ticket => new Date(ticket.created_at) >= startDate);
    }
    
    if (dateFilter.endDate) {
      const endDate = new Date(dateFilter.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(ticket => new Date(ticket.created_at) <= endDate);
    }
    
    setFilteredTickets(filtered);
  }, [searchTerm, statusFilter, priorityFilter, dateFilter, tickets]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    await fetchTickets(false);
    await fetchStats();
  }, [fetchTickets, fetchStats]);

  // Handle filter change
  const handleFilterChange = useCallback((newFilter: 'all' | 'my-tickets') => {
    setFilter(newFilter);
    navigate(`?filter=${newFilter}`, { replace: true });
  }, [navigate]);

  // Handle stat card click
  const handleStatCardClick = useCallback((statType: string) => {
    setActiveStatFilter(prev => prev === statType ? '' : statType);
  }, []);

  // Clear all filters
  const clearAdvancedFilters = useCallback(() => {
    setDateFilter({ startDate: '', endDate: '' });
    setPriorityFilter('');
    setStatusFilter('');
    setSearchTerm('');
    setActiveStatFilter('');
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="dashboard-actions">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            All Tickets
          </button>
          <button 
            className={`filter-btn ${filter === 'my-tickets' ? 'active' : ''}`}
            onClick={() => handleFilterChange('my-tickets')}
          >
            My Tickets
          </button>
          <button 
            className="refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-container">
        {[
          { id: 'total', label: 'Total', value: stats.total },
          { id: 'open', label: 'Open', value: stats.open },
          { id: 'pending', label: 'Pending', value: stats.pending },
          { id: 'resolved', label: 'Resolved', value: stats.resolved },
          { id: 'closed', label: 'Closed', value: stats.closed }
        ].map(stat => (
          <div 
            key={stat.id}
            className={`stat-card ${activeStatFilter === stat.id ? 'active' : ''}`}
            onClick={() => handleStatCardClick(stat.id)}
          >
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="filters-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-options">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {['Open', 'Pending', 'Resolved', 'Closed'].map(status => (
              <option key={status} value={status.toLowerCase()}>
                {status}
              </option>
            ))}
          </select>

          <select 
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            {['High', 'Medium', 'Low'].map(priority => (
              <option key={priority} value={priority.toLowerCase()}>
                {priority}
              </option>
            ))}
          </select>

          <button 
            className="clear-filters"
            onClick={clearAdvancedFilters}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="tickets-table-container">
        {error ? (
          <div className="error-message">{error}</div>
        ) : filteredTickets.length === 0 ? (
          <div className="no-results">No tickets found matching your criteria.</div>
        ) : (
          <table className="tickets-table">
            <thead>
              <tr>
                <th>Ticket #</th>
                <th>Customer</th>
                <th>Site</th>
                <th>Equipment</th>
                <th>Category</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(ticket => (
                <tr key={ticket.id}>
                  <td>
                    <Link to={`/tickets/${ticket.id}`}>
                      {ticket.ticket_number || 'N/A'}
                    </Link>
                  </td>
                  <td>{ticket.customer_name || 'N/A'}</td>
                  <td>{ticket.site_name || 'N/A'}</td>
                  <td>{ticket.equipment || 'N/A'}</td>
                  <td>{ticket.category || 'N/A'}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(ticket.ticket_status)}`}>
                      {getStatusIcon(ticket.ticket_status)} {ticket.ticket_status || 'Open'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getPriorityBadge(ticket.priority)}`}>
                      {getPriorityIcon(ticket.priority)} {ticket.priority || 'Low'}
                    </span>
                  </td>
                  <td>{formatDate(ticket.created_at)}</td>
                  <td>
                    <Link 
                      to={`/tickets/${ticket.id}`}
                      className="btn btn-small"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Last Updated */}
      <div className="last-updated">
        Last updated: {lastUpdate.toLocaleString()}
      </div>
    </div>
  );
};

export default Dashboard;
