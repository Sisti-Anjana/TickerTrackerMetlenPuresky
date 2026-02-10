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
import '../styles/export-modal.css';

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
  status?: string; // Fallback field for status
  issue_start_time?: string;
  issue_end_time?: string;
  total_duration?: string;
  kw_down?: number;
  case_number?: string;
  issue_description?: string;
  additional_notes?: string;
  priority?: string;
  created_at: string;
  closed_at?: string; // For closed/resolved tickets
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

const Dashboard = (): JSX.Element => {
  // Component state and hooks
  // This ensures the component always returns a valid JSX element
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

  // Advanced filter states
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeStatFilter, setActiveStatFilter] = useState('');

  // CSV Export states
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportDateRange, setExportDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showProfessionalReport, setShowProfessionalReport] = useState(false);

  // Enhanced ticket fetching with proper My Tickets support
  const PAGE_SIZE = 25;
  const [currentPage, setCurrentPage] = useState(0);

  const fetchTickets = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);

      setError('');
      console.log('🎫 Fetching tickets with filter:', filter);
      console.log('👤 Current user:', user?.name, 'ID:', user?.id);

      // Always fetch all tickets first
      const params: Record<string, string> = {
        limit: '500'
      };
      if (filter === 'my-tickets') {
        params.filter = 'my-tickets';
      }
      const response = await api.get('/tickets', { params });

      console.log('📊 Raw Tickets API Response:', response.data);
      console.log('📊 Number of tickets from API:', response.data?.tickets?.length || 0);

      if (response.data?.tickets) {
        let ticketsData = response.data.tickets;
        const originalCount = ticketsData.length;

        console.log('📊 IMPORTANT: We have', originalCount, 'tickets from API');
        console.log('📊 First ticket sample from API:', ticketsData[0]);
        console.log('📊 User info for matching:', {
          userId: user?.id,
          userName: user?.name,
          userEmail: user?.email
        });

        // Apply My Tickets filter immediately if needed
        if (filter === 'my-tickets' && user) {
          console.log('🔍 BEFORE My Tickets filter:', ticketsData.length, 'tickets');

          // Let's check what fields exist in the tickets
          console.log('📊 Checking ticket fields:', Object.keys(ticketsData[0] || {}));

          ticketsData = ticketsData.filter((ticket: any) => {
            // FIXED: Check for user_id field (not created_by)!
            const isCreatedByUserId = ticket.user_id === user.id;
            const isCreatedByName = ticket.customer_name === user.name;
            const isCreatedByEmail = ticket.created_by_email === user.email;

            // Also keep old checks as fallback for backward compatibility
            const isCreatedByOld = ticket.created_by === user.id || ticket.created_by_name === user.name;

            const isCreatedByUser = isCreatedByUserId || isCreatedByName || isCreatedByEmail || isCreatedByOld;

            if (isCreatedByUser) {
              console.log('✅ Ticket created by user:', ticket.ticket_number, {
                ticket_user_id: ticket.user_id,
                ticket_customer_name: ticket.customer_name,
                user_id: user.id,
                user_name: user.name
              });
            }

            return isCreatedByUser;
          });
          console.log('🔍 AFTER My Tickets filter:', ticketsData.length, 'tickets');
          console.log(`🎫 My Tickets Filter: ${originalCount} → ${ticketsData.length} tickets created by ${user.name}`);
        } else {
          console.log('🔍 Using ALL tickets mode:', ticketsData.length, 'tickets');
        }

        setTickets(ticketsData);
        setFilteredTickets(ticketsData);
        setLastUpdate(new Date());

        console.log(`✅ Final loaded tickets: ${ticketsData.length} for filter: ${filter}`);
        console.log('📊 Sample tickets:', ticketsData.slice(0, 2).map((t: any) => ({
          ticket_number: t.ticket_number,
          status: t.ticket_status,
          status_alt: t.status,
          created_by: t.created_by_name
        })));

        // Find and log AGS11 specifically
        const ags11 = ticketsData.find((t: any) => t.ticket_number === 'AGS11');
        if (ags11) {
          console.log('⌕ AGS11 DETAILED DATA:', {
            ticket_number: ags11.ticket_number,
            ticket_status: ags11.ticket_status,
            status: ags11.status,
            ticket_status_value: JSON.stringify(ags11.ticket_status),
            status_value: JSON.stringify(ags11.status),
            closed_at: ags11.closed_at,
            all_fields: Object.keys(ags11),
            full_ticket: ags11
          });
        }

        // Log ALL tickets with their status fields
        console.log('📊 ALL TICKETS STATUS CHECK:', ticketsData.map((t: any) => ({
          ticket_number: t.ticket_number,
          ticket_status: t.ticket_status,
          status: t.status,
          closed_at: t.closed_at
        })));
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
  }, [filter, user]); // Only depend on filter and user ID

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
  }, [filter]); // Only depend on filter

  // Initial data loading
  useEffect(() => {
    console.log('🚀 Dashboard mounted for user:', user?.name);
    if (user) {
      fetchTickets(true);
      fetchStats();
      refreshUser(); // Refresh user data to ensure it's current
    }
  }, [user?.id]); // Only depend on user ID to prevent infinite loops

  // Refetch when filter changes
  useEffect(() => {
    if (user?.id) {
      fetchTickets(false);
      fetchStats();
    }
  }, [filter]); // Remove the dependency on fetchTickets and fetchStats

  // Reset pagination when core filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [
    filter,
    searchTerm,
    priorityFilter,
    statusFilter,
    activeStatFilter,
    dateFilter.startDate,
    dateFilter.endDate
  ]);

  useEffect(() => {
    const lastPageIndex = Math.max(0, Math.ceil(filteredTickets.length / PAGE_SIZE) - 1);
    setCurrentPage(prev => Math.min(prev, lastPageIndex));
  }, [filteredTickets.length]);

  // Simplified search functionality (My Tickets already filtered at fetch level)
  useEffect(() => {
    console.log('🔍 Search Effect Running:', {
      filter,
      totalTickets: tickets.length,
      searchTerm,
      activeStatFilter
    });

    let filtered = tickets; // tickets already filtered for My Tickets
    console.log('📊 Starting with tickets:', filtered.length);

    // Apply stat card filter
    if (activeStatFilter) {
      console.log('🎯 Applying stat filter:', activeStatFilter);
      const beforeStatFilter = filtered.length;

      // Log all unique statuses in current tickets
      const uniqueStatuses = Array.from(new Set(filtered.map(t => t.ticket_status)));
      console.log('📊 Unique statuses in tickets:', uniqueStatuses);

      switch (activeStatFilter) {
        case 'total':
          // Show all tickets (no additional filtering needed)
          console.log('📊 Total filter - showing all');
          break;
        case 'open':
          filtered = filtered.filter(ticket => ticket.ticket_status?.toLowerCase() === 'open');
          console.log(`📊 Open filter: ${beforeStatFilter} → ${filtered.length}`);
          break;
        case 'pending':
          filtered = filtered.filter(ticket => ticket.ticket_status?.toLowerCase() === 'pending');
          console.log(`📊 Pending filter: ${beforeStatFilter} → ${filtered.length}`);
          console.log('📊 Pending tickets:', filtered.map(t => ({ number: t.ticket_number, status: t.ticket_status })));
          break;
        case 'closed':
          filtered = filtered.filter(ticket => ticket.ticket_status?.toLowerCase() === 'closed');
          console.log(`📊 Closed filter: ${beforeStatFilter} → ${filtered.length}`);
          break;
        case 'production':
          filtered = filtered.filter(ticket => ticket.category?.toLowerCase().includes('production'));
          console.log(`📊 Production filter: ${beforeStatFilter} → ${filtered.length}`);
          break;
        case 'today':
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          filtered = filtered.filter(ticket => {
            const ticketDate = new Date(ticket.created_at);
            return ticketDate >= today && ticketDate < tomorrow;
          });
          console.log(`📊 Today filter: ${beforeStatFilter} → ${filtered.length}`);
          break;
      }
    }

    // Apply text search
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(ticket =>
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
    }

    // Apply date filter
    if (dateFilter.startDate) {
      const startDate = new Date(dateFilter.startDate);
      filtered = filtered.filter(ticket => {
        const ticketDate = new Date(ticket.created_at);
        return ticketDate >= startDate;
      });
    }

    if (dateFilter.endDate) {
      const endDate = new Date(dateFilter.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(ticket => {
        const ticketDate = new Date(ticket.created_at);
        return ticketDate <= endDate;
      });
    }

    // Apply priority filter
    if (priorityFilter) {
      filtered = filtered.filter(ticket =>
        ticket.priority?.toLowerCase() === priorityFilter.toLowerCase()
      );
    }

    // Apply status filter (only if no stat filter is active)
    if (statusFilter && !activeStatFilter) {
      filtered = filtered.filter(ticket =>
        ticket.ticket_status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    console.log(`🎯 Final filtered tickets: ${filtered.length}`);
    setFilteredTickets(filtered);
  }, [searchTerm, tickets, dateFilter, priorityFilter, statusFilter, activeStatFilter, filter]);

  // Auto-refresh every 30 seconds when page is active
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden && user?.id) {
        console.log('🔄 Auto-refreshing dashboard data...');
        fetchTickets(false);
        fetchStats();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user?.id, filter]); // Minimal dependencies

  // Manual refresh handler
  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    await fetchTickets(false);
    await fetchStats();
  };

  // Read URL parameters to set filters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const filterParam = urlParams.get('filter');
    const statusParam = urlParams.get('status');
    const priorityParam = urlParams.get('priority');

    console.log('🔍 URL Search:', location.search);
    console.log('🔍 Filter Param:', filterParam);

    if (filterParam === 'my-tickets') {
      console.log('✅ Setting filter to my-tickets');
      setFilter('my-tickets');
    } else {
      console.log('✅ Setting filter to all');
      setFilter('all');
    }

    if (statusParam) {
      setStatusFilter(statusParam);
    }

    if (priorityParam) {
      setPriorityFilter(priorityParam);
    }
  }, [location.search]);

  // Filter change handler - Updates URL to persist filter
  const handleFilterChange = (newFilter: 'all' | 'my-tickets') => {
    console.log('🔄 Filter changed to:', newFilter);
    setFilter(newFilter);

    // Update URL to persist the filter
    if (newFilter === 'my-tickets') {
      navigate('/dashboard?filter=my-tickets', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }

    setSearchTerm(''); // Clear search when changing filter
    clearAdvancedFilters(); // Clear advanced filters when changing main filter
  };

  // Calculate stats from current filtered tickets (for stat cards)
  const calculateStats = useCallback((ticketList: any[]): DashboardStats => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const currentStats: DashboardStats = {
      total: ticketList.length,
      open: ticketList.filter(t => (t.ticket_status || t.status)?.toLowerCase() === 'open').length,
      pending: ticketList.filter(t => (t.ticket_status || t.status)?.toLowerCase() === 'pending').length,
      closed: ticketList.filter(t => (t.ticket_status || t.status)?.toLowerCase() === 'closed').length,
      resolved: ticketList.filter(t => (t.ticket_status || t.status)?.toLowerCase() === 'resolved').length,
      production_impacting: ticketList.filter(t =>
        t.category?.toLowerCase().includes('production') ||
        t.priority?.toLowerCase() === 'urgent'
      ).length,
      communication_issues: ticketList.filter(t =>
        t.category?.toLowerCase().includes('communication') ||
        t.issue_description?.toLowerCase().includes('communication')
      ).length,
      cannot_confirm: ticketList.filter(t =>
        t.category?.toLowerCase().includes('cannot confirm') ||
        t.issue_description?.toLowerCase().includes('cannot confirm')
      ).length,
      today: ticketList.filter(t => {
        const ticketDate = new Date(t.created_at);
        return ticketDate >= today && ticketDate < tomorrow;
      }).length,
      this_week: ticketList.filter(t => {
        const ticketDate = new Date(t.created_at);
        return ticketDate >= thisWeekStart;
      }).length,
      this_month: ticketList.filter(t => {
        const ticketDate = new Date(t.created_at);
        return ticketDate >= thisMonthStart;
      }).length,
      filter: filter,
      user: user?.name || '',
      last_updated: new Date().toISOString()
    };

    return currentStats;
  }, [filter, user?.name]);

  // Update stats when tickets change (this respects My Tickets filtering)
  useEffect(() => {
    console.log('📊 Stats calculation triggered:', {
      filter,
      ticketsLength: tickets.length,
      sampleTicket: tickets[0] ? {
        ticket_number: tickets[0].ticket_number,
        status: tickets[0].ticket_status,
        created_by: tickets[0].created_by_name
      } : 'No tickets'
    });

    if (tickets.length >= 0) { // Always calculate, even for 0 tickets
      const newStats = calculateStats(tickets);
      console.log('📊 Stats calculated:', newStats);
      setStats(newStats);
    }
  }, [tickets, calculateStats]);

  // Clear all filters (restored)
  const clearAdvancedFilters = () => {
    setDateFilter({ startDate: '', endDate: '' });
    setPriorityFilter('');
    setStatusFilter('');
    setSearchTerm('');
    setActiveStatFilter('');
  };

  // Check if any advanced filters are active (restored)
  const hasActiveFilters = () => {
    return searchTerm || dateFilter.startDate || dateFilter.endDate || priorityFilter || statusFilter || activeStatFilter;
  };

  // Handle stat card clicks (restored)
  const handleStatCardClick = (statType: string) => {
    console.log('🎯 Stat card clicked:', statType);
    console.log('📊 Current state:', {
      activeStatFilter,
      tickets: tickets.length,
      filteredTickets: filteredTickets.length
    });

    // Clear other filters when clicking a stat card
    setSearchTerm('');
    setDateFilter({ startDate: '', endDate: '' });
    setPriorityFilter('');
    setStatusFilter('');

    // Toggle the stat filter
    if (activeStatFilter === statType) {
      console.log('✅ Clearing stat filter');
      setActiveStatFilter(''); // Clear if already selected
    } else {
      console.log('✅ Setting stat filter to:', statType);
      setActiveStatFilter(statType);
    }
  };

  // CSV Export Functions
  const formatDurationForCSV = (startTime?: string, endTime?: string, totalDuration?: string, status?: string, closedAt?: string): string => {
    if (totalDuration && totalDuration !== 'calculating...') {
      return totalDuration;
    }

    if (!startTime) return 'N/A';

    const start = new Date(startTime);
    let end: Date;

    const currentStatus = (status || '').toLowerCase();
    if (currentStatus === 'closed' || currentStatus === 'resolved') {
      end = closedAt ? new Date(closedAt) : (endTime ? new Date(endTime) : new Date());
    } else {
      end = endTime ? new Date(endTime) : new Date();
    }

    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) return 'N/A';

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const exportToCSV = () => {
    // Filter tickets based on date range if provided
    let ticketsToExport = filteredTickets;

    if (exportDateRange.startDate || exportDateRange.endDate) {
      ticketsToExport = filteredTickets.filter(ticket => {
        const ticketDate = new Date(ticket.created_at);
        const startDate = exportDateRange.startDate ? new Date(exportDateRange.startDate) : null;
        const endDate = exportDateRange.endDate ? new Date(exportDateRange.endDate) : null;

        // Set end date to end of day if provided
        if (endDate) {
          endDate.setHours(23, 59, 59, 999);
        }

        // Set start date to start of day if provided
        if (startDate) {
          startDate.setHours(0, 0, 0, 0);
        }

        if (startDate && endDate) {
          return ticketDate >= startDate && ticketDate <= endDate;
        } else if (startDate) {
          return ticketDate >= startDate;
        } else if (endDate) {
          return ticketDate <= endDate;
        }
        return true;
      });
    }

    if (ticketsToExport.length === 0) {
      alert('No tickets to export with the selected date range.');
      return;
    }

    // CSV Headers - Match table structure
    const headers = [
      'Created Date',
      'Ticket Number',
      'Site Name',
      'Equipment',
      'Category',
      'Description',
      'Priority',
      'Site Outage',
      'Status',
      'Requestor'
    ];

    // Convert tickets to CSV rows - Match table structure
    const csvRows = ticketsToExport.map(ticket => {
      const row = [
        formatDate(ticket.created_at),
        ticket.ticket_number || 'N/A',
        ticket.site_name || 'N/A',
        ticket.equipment || 'N/A',
        ticket.category || 'N/A',
        ticket.issue_description || 'N/A',
        ticket.priority || 'N/A',
        ticket.site_outage || 'No',
        ticket.ticket_status || ticket.status || 'Open',
        ticket.users?.name || ticket.created_by_name || 'Unknown'
      ];

      // Escape fields that contain commas or quotes
      return row.map(field => {
        const fieldStr = String(field);
        if (fieldStr.includes(',') || fieldStr.includes('"') || fieldStr.includes('\n')) {
          return `"${fieldStr.replace(/"/g, '""')}"`;
        }
        return fieldStr;
      }).join(',');
    });

    // Combine headers and rows
    const csvContent = [headers.join(','), ...csvRows].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);

    // Generate filename with date range if applicable
    let filename = 'tickets_export';
    if (exportDateRange.startDate && exportDateRange.endDate) {
      filename += `_${exportDateRange.startDate}_to_${exportDateRange.endDate}`;
    } else if (exportDateRange.startDate) {
      filename += `_from_${exportDateRange.startDate}`;
    } else if (exportDateRange.endDate) {
      filename += `_until_${exportDateRange.endDate}`;
    }
    filename += `_${new Date().toISOString().split('T')[0]}.csv`;

    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Close modal and reset date range
    setShowExportModal(false);
    setExportDateRange({ startDate: '', endDate: '' });
  };

  const handleExportClick = () => {
    setShowExportMenu(!showExportMenu);
  };

  const handleProfessionalReport = () => {
    setShowProfessionalReport(true);
    setShowExportMenu(false);
  };

  const handleExportCancel = () => {
    setShowExportModal(false);
    setExportDateRange({ startDate: '', endDate: '' });
  };

  // Format date for input (YYYY-MM-DD to MM/DD/YYYY)
  const formatDateForInput = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Parse MM/DD/YYYY to YYYY-MM-DD for filtering
  const parseDateInput = (dateStr: string): string => {
    if (!dateStr) return '';
    // Remove any non-numeric characters except /
    const cleaned = dateStr.replace(/[^\d/]/g, '');
    const parts = cleaned.split('/');

    if (parts.length === 3) {
      const month = parts[0].padStart(2, '0');
      const day = parts[1].padStart(2, '0');
      let year = parts[2];

      // Handle 2-digit year
      if (year.length === 2) {
        year = '20' + year;
      }

      // Validate
      const monthNum = parseInt(month);
      const dayNum = parseInt(day);
      const yearNum = parseInt(year);

      if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31 && yearNum >= 1900) {
        return `${year}-${month}-${day}`;
      }
    }
    return '';
  };

  // Handle date input with auto-formatting
  const handleDateInput = (value: string, field: 'startDate' | 'endDate') => {
    // Remove non-numeric characters
    let cleaned = value.replace(/\D/g, '');

    // Auto-format as MM/DD/YYYY
    let formatted = '';
    if (cleaned.length > 0) {
      formatted = cleaned.substring(0, 2);
      if (cleaned.length > 2) {
        formatted += '/' + cleaned.substring(2, 4);
      }
      if (cleaned.length > 4) {
        formatted += '/' + cleaned.substring(4, 8);
      }
    }

    // Update display value
    if (field === 'startDate') {
      setDateFilter(prev => ({ ...prev, startDate: parseDateInput(formatted) }));
    } else {
      setDateFilter(prev => ({ ...prev, endDate: parseDateInput(formatted) }));
    }
  };

  // Status change handler
  const handleStatusChange = async (ticketId: string, newStatus: string, ticketNumber: string) => {
    try {
      setRefreshing(true);
      console.log('Changing status to:', newStatus, 'for ticket:', ticketId);

      const updateData: any = {
        ticket_status: newStatus
      };

      // Auto-set timestamps based on status
      if (newStatus === 'closed') {
        updateData.issue_end_time = new Date().toISOString();
        updateData.closed_at = new Date().toISOString();
      }

      const response = await api.put(`/tickets/${ticketId}`, updateData);

      console.log('Status updated successfully:', response.data);

      // Refresh the tickets list
      await fetchTickets(false);
      await fetchStats();

      // Show success message
      alert(`Ticket ${ticketNumber} status changed to ${newStatus}!`);

    } catch (error: any) {
      console.error('Error updating status:', error);
      alert(`Failed to update status: ${error.response?.data?.message || error.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteTicket = async (ticketId: string, ticketNumber: string) => {
    const confirmed = window.confirm(`Delete ticket ${ticketNumber}? This cannot be undone.`);
    if (!confirmed) {
      return;
    }
    try {
      await api.delete(`/tickets/${ticketId}`);
      setTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
      setFilteredTickets(prev => {
        const updated = prev.filter(ticket => ticket.id !== ticketId);
        setCurrentPage(curr => {
          const lastPageIndex = Math.max(0, Math.ceil(updated.length / PAGE_SIZE) - 1);
          return Math.min(curr, lastPageIndex);
        });
        return updated;
      });
    } catch (error: any) {
      console.error('Failed to delete ticket:', error);
      alert(error.response?.data?.message || 'Failed to delete ticket. Please try again.');
    }
  };

  const formatDuration = (startTime?: string, endTime?: string, totalDuration?: string, ticketStatus?: string, closedAt?: string) => {
    if (totalDuration) return totalDuration;

    if (startTime) {
      const start = new Date(startTime);
      let end: Date;

      // For Closed tickets, use closed_at if available; otherwise use endTime
      if (ticketStatus?.toLowerCase() === 'closed' && closedAt) {
        end = new Date(closedAt);
      } else if (endTime) {
        end = new Date(endTime);
      } else {
        // For Open/Pending tickets, use current time
        end = new Date();
      }

      const diffMs = end.getTime() - start.getTime();
      if (diffMs < 0) return 'N/A';

      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${diffHours}h ${diffMinutes}m`;
    }
    return 'N/A';
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
          <small>Please wait while we fetch your tickets</small>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="page">
        <div className="alert alert-error">
          <div className="alert-content">
            <strong>Error:</strong> {error}
            <button onClick={handleRefresh} className="btn btn-small btn-outline">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main component return
  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / PAGE_SIZE));
  const pageStart = filteredTickets.length === 0 ? 0 : currentPage * PAGE_SIZE + 1;
  const pageEnd = Math.min(filteredTickets.length, (currentPage + 1) * PAGE_SIZE);
  const paginatedTickets = filteredTickets.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE
  );

  const renderPaginationControls = filteredTickets.length > PAGE_SIZE && (
    <div className="ticket-pagination">
      <button
        className="pagination-btn"
        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
        disabled={currentPage === 0}
      >
        ←
      </button>
      <div className="pagination-summary">
        Showing <strong>{pageStart}</strong> - <strong>{pageEnd}</strong> of{' '}
        <strong>{filteredTickets.length}</strong>
      </div>
      <button
        className="pagination-btn"
        onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
        disabled={currentPage >= totalPages - 1}
      >
        →
      </button>
    </div>
  );

  return (
    <>
      {/* Top Header */}


      <div className="page">
        {/* Enhanced Dashboard Header */}
        <div className="dashboard-header">
          <div className="dashboard-actions-container">
            <div className="filter-buttons">
              <button
                onClick={() => handleFilterChange('all')}
                className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
              >
                All Tickets
              </button>
              <button
                onClick={() => handleFilterChange('my-tickets')}
                className={`btn ${filter === 'my-tickets' ? 'btn-primary' : 'btn-outline'}`}
              >
                My Tickets
              </button>
            </div>

            <div className="view-toggle">
              <button
                onClick={() => setViewMode('table')}
                className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline'}`}
                title="Table View"
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`btn ${viewMode === 'cards' ? 'btn-primary' : 'btn-outline'}`}
                title="Card View"
              >
                Cards
              </button>
            </div>

            <button
              onClick={handleRefresh}
              className="btn btn-outline"
              disabled={refreshing}
            >
              {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
            </button>

            <Link to="/create-ticket" className="btn btn-primary">
              ➕ Create New Ticket
            </Link>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-error">
            <div className="alert-content">
              <strong>Error:</strong> {error}
              <button onClick={handleRefresh} className="btn btn-small btn-outline">
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards - Moved here below header */}
        <div className="dashboard-stats">
          <div
            className={`stat-card total ${activeStatFilter === 'total' ? 'active' : ''}`}
            onClick={() => handleStatCardClick('total')}
          >
            <div className="stat-content">
              <div className="stat-label">Total Tickets</div>
              <div className="stat-number">{stats.total}</div>
            </div>
          </div>
          <div
            className={`stat-card open ${activeStatFilter === 'open' ? 'active' : ''}`}
            onClick={() => handleStatCardClick('open')}
          >
            <div className="stat-content">
              <div className="stat-label">Open</div>
              <div className="stat-number">{stats.open}</div>
            </div>
          </div>
          <div
            className={`stat-card pending ${activeStatFilter === 'pending' ? 'active' : ''}`}
            onClick={() => handleStatCardClick('pending')}
          >
            <div className="stat-content">
              <div className="stat-label">Pending</div>
              <div className="stat-number">{stats.pending}</div>
            </div>
          </div>
          <div
            className={`stat-card closed ${activeStatFilter === 'closed' ? 'active' : ''}`}
            onClick={() => handleStatCardClick('closed')}
          >
            <div className="stat-content">
              <div className="stat-label">Closed</div>
              <div className="stat-number">{stats.closed}</div>
            </div>
          </div>
          <div
            className={`stat-card production ${activeStatFilter === 'production' ? 'active' : ''}`}
            onClick={() => handleStatCardClick('production')}
          >
            <div className="stat-content">
              <div className="stat-label">Production Impacting</div>
              <div className="stat-number">{stats.production_impacting}</div>
            </div>
          </div>
          <div
            className={`stat-card today ${activeStatFilter === 'today' ? 'active' : ''}`}
            onClick={() => handleStatCardClick('today')}
          >
            <div className="stat-content">
              <div className="stat-label">Today</div>
              <div className="stat-number">{stats.today}</div>
            </div>
          </div>
        </div>

        {/* Search Bar with Filters - Moved below stats cards */}
        <div className="search-and-filters-container">
          <div className="search-container">

            <input
              type="text"
              className="search-input"
              placeholder="Search all tickets by number, customer, equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="inline-filters">
            <div className="filter-group">
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="filter-group">
              <select
                className="filter-select"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <span className="date-separator-label">FROM</span>
            <input
              type="date"
              className="filter-input date-input"
              value={dateFilter.startDate}
              onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
            />

            <span className="date-separator-label">TO</span>
            <input
              type="date"
              className="filter-input date-input"
              value={dateFilter.endDate}
              onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
            />

            {hasActiveFilters() && (
              <button className="clear-all-filters" onClick={clearAdvancedFilters}>
                Clear Filters
              </button>
            )}
          </div>

          <div className="search-results-count">
            {filteredTickets.length} of {tickets.length} tickets
          </div>
        </div>

        {/* Tickets List */}
        <div className="tickets-section">
          <div className="section-header">
            <div className="section-header-content">
              <div className="section-title-wrapper">
                <h2 className="section-title">
                  {searchTerm ? `Search Results (${filteredTickets.length})` :
                    filter === 'my-tickets' ? 'Your Recent Tickets' : 'Recent Tickets'}
                </h2>
                {!searchTerm && (
                  <div className="section-meta">
                    Showing {filteredTickets.length} {filter === 'my-tickets' ? 'of your tickets' : 'tickets'}
                  </div>
                )}
              </div>
              <div className="section-actions-wrapper">
                <div style={{ position: 'relative' }}>
                  <button
                    className="btn btn-primary"
                    onClick={handleExportClick}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px'
                    }}
                  >
                    Export / Present
                    <span style={{ fontSize: '12px' }}>{showExportMenu ? '▲' : '▼'}</span>
                  </button>

                  {showExportMenu && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '8px',
                      background: 'white',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      minWidth: '250px',
                      zIndex: 1000,
                      overflow: 'hidden'
                    }}>
                      <button
                        onClick={handleProfessionalReport}
                        style={{
                          width: '100%',
                          padding: '14px 20px',
                          border: 'none',
                          background: 'white',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          fontSize: '14px',
                          color: '#1f2937',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                      >

                        <div>
                          <div style={{ fontWeight: '600' }}>Professional Report</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>Beautiful formatted view</div>
                        </div>
                      </button>
                      <button
                        onClick={() => { setShowExportModal(true); setShowExportMenu(false); }}
                        style={{
                          width: '100%',
                          padding: '14px 20px',
                          border: 'none',
                          background: 'white',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          fontSize: '14px',
                          color: '#1f2937',
                          transition: 'background 0.2s',
                          borderTop: '1px solid #f3f4f6'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                      >
                        <span style={{ fontSize: '20px' }}></span>
                        <div>
                          <div style={{ fontWeight: '600' }}>Export to CSV</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>Download spreadsheet</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="empty-state">
              {searchTerm ? (
                <>
                  <div className="empty-icon">🔍︎</div>
                  <h3>No tickets found</h3>
                  <p>No tickets match your search "{searchTerm}"</p>
                  <button onClick={() => setSearchTerm('')} className="btn btn-outline">
                    Clear Search
                  </button>
                </>
              ) : (
                <>
                  <div className="empty-icon">📋</div>
                  <h3>{filter === 'my-tickets' ? 'No tickets yet' : 'No tickets in system'}</h3>
                  <p>
                    {filter === 'my-tickets'
                      ? "You haven't created any tickets yet."
                      : 'No tickets have been created in the system yet.'}
                  </p>
                  <Link to="/create-ticket" className="btn btn-primary">
                    Create Your First Ticket
                  </Link>
                </>
              )}
            </div>
          ) : viewMode === 'table' ? (
            <div className="tickets-table-container">
              {renderPaginationControls}
              <table className="tickets-table">
                <thead>
                  <tr>
                    <th>Created Date</th>
                    <th>Ticket #</th>
                    <th>Site Name</th>
                    <th>Equipment</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Priority</th>
                    <th>Site Outage</th>
                    <th>Status</th>
                    <th>Requestor</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      {/* Created Date */}
                      <td className="created-date-cell" data-label="Created Date">
                        {formatDate(ticket.created_at)}
                      </td>

                      {/* Ticket Number */}
                      <td className="ticket-number-cell" data-label="Ticket #">
                        <Link to={`/tickets/${ticket.id}`} className="ticket-number-link">
                          {ticket.ticket_number || 'No Number'}
                        </Link>
                      </td>

                      {/* Site Name */}
                      <td className="site-cell" data-label="Site Name">
                        {ticket.site_name || 'N/A'}
                      </td>

                      {/* Equipment */}
                      <td className="equipment-cell" data-label="Equipment">
                        {ticket.equipment || 'N/A'}
                      </td>

                      {/* Category */}
                      <td className="category-cell" data-label="Category">
                        <span className={`category-badge category-${ticket.category?.toLowerCase().replace(/\s+/g, '-')}`}>
                          {ticket.category || 'Other'}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="description-cell" data-label="Description">
                        <div className="description-text">
                          {ticket.issue_description || 'No description'}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="priority-cell" data-label="Priority">
                        <span className={`priority-badge priority-${(ticket.priority || 'medium').toLowerCase()}`}>
                          {ticket.priority || 'Medium'}
                        </span>
                      </td>

                      {/* Outage */}
                      <td className="outage-cell" data-label="Site Outage">
                        <span className={`badge ${getOutageBadge(ticket.site_outage)}`}>
                          {ticket.site_outage || 'No'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="status-cell" data-label="Status">
                        <span className={`status-badge status-${(ticket.ticket_status || ticket.status || 'open').toLowerCase()}`}>
                          {ticket.ticket_status || ticket.status || 'Open'}
                        </span>
                      </td>

                      {/* Requestor Name */}
                      <td className="created-by-cell" data-label="Requestor">
                        {ticket.users?.name || ticket.created_by_name || 'Unknown'}
                      </td>

                      {/* Actions */}
                      <td className="actions-cell" data-label="Actions">
                        <div className="ticket-action-buttons">
                          <Link
                            to={`/tickets/${ticket.id}`}
                            className="btn btn-small btn-outline"
                            style={{ padding: '6px 10px' }}
                          >
                            View
                          </Link>
                          {(ticket.is_owner || (user as any)?.role === 'admin') && (
                            <button
                              className="btn btn-small btn-danger"
                              onClick={() => handleDeleteTicket(ticket.id, ticket.ticket_number || 'Unknown')}
                              disabled={refreshing}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {renderPaginationControls}
            </div>
          ) : (
            // Card View - Compact and organized
            <>
              {renderPaginationControls}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: '16px',
                  padding: '16px'
                }}
              >
                {paginatedTickets.map(ticket => (
                  <div
                    key={ticket.id}
                    style={{
                      background: 'white',
                      borderRadius: '8px',
                      padding: '16px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {/* Header */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '12px'
                      }}
                    >
                      <Link
                        to={`/tickets/${ticket.id}`}
                        style={{
                          fontWeight: '600',
                          color: '#3b82f6',
                          textDecoration: 'none',
                          fontSize: '16px'
                        }}
                      >
                        {ticket.ticket_number || 'No Number'}
                      </Link>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        <span className={`badge ${getStatusBadge(ticket.ticket_status)}`}>
                          {getStatusIcon(ticket.ticket_status)} {ticket.ticket_status || 'Open'}
                        </span>
                        {ticket.is_owner && <span className="owner-badge">👤</span>}
                      </div>
                    </div>

                    {/* Main Content */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px',
                        fontSize: '14px',
                        marginBottom: '12px'
                      }}
                    >
                      <div>
                        <strong>Customer:</strong>
                        <div style={{ color: '#6b7280' }}>{ticket.customer_name || 'N/A'}</div>
                      </div>
                      <div>
                        <strong>Site:</strong>
                        <div style={{ color: '#6b7280' }}>{ticket.site_name || 'N/A'}</div>
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <strong>Equipment:</strong>
                        <div style={{ color: '#6b7280' }}>{ticket.equipment || 'N/A'}</div>
                      </div>
                      <div>
                        <strong>Category:</strong>
                        <div>
                          <span className={`badge ${getCategoryBadge(ticket.category)}`}>
                            {ticket.category || 'Unknown'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <strong>Duration:</strong>
                        <div style={{ color: '#6b7280' }}>
                          {formatDuration(ticket.issue_start_time, ticket.issue_end_time, ticket.total_duration)}
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div
                      style={{
                        paddingTop: '12px',
                        borderTop: '1px solid #f1f5f9',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '12px',
                        color: '#6b7280'
                      }}
                    >
                      <div>
                        <div>By: {ticket.users?.name || ticket.created_by_name || 'Unknown'}</div>
                        <div>{formatDate(ticket.created_at)}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '140px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link
                            to={`/tickets/${ticket.id}`}
                            className="btn btn-small btn-outline"
                            style={{ flex: 1, textAlign: 'center' }}
                          >
                            View
                          </Link>
                          {(ticket.is_owner || (user as any)?.role === 'admin') && (
                            <button
                              className="btn btn-small btn-danger"
                              style={{ flex: 1 }}
                              onClick={() => handleDeleteTicket(ticket.id, ticket.ticket_number || 'Unknown')}
                              disabled={refreshing}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                        {ticket.is_owner && (
                          <div>
                            <label
                              style={{
                                fontSize: '10px',
                                color: '#6b7280',
                                marginBottom: '2px',
                                display: 'block'
                              }}
                            >
                              Status:
                            </label>
                            <select
                              value={ticket.ticket_status?.toLowerCase() || 'open'}
                              onChange={e =>
                                handleStatusChange(ticket.id, e.target.value, ticket.ticket_number || 'Unknown')
                              }
                              className="form-select"
                              style={{
                                width: '100%',
                                fontSize: '11px',
                                padding: '2px 4px'
                              }}
                              disabled={refreshing}
                            >
                              <option value="open">Open</option>
                              <option value="pending">Pending</option>
                              <option value="closed">Closed</option>
                            </select>
                          </div>
                        )}
                        {ticket.ticket_status === 'closed' && ticket.closed_at && (
                          <div style={{ fontSize: '10px', color: '#059669', textAlign: 'center' }}>
                            <strong>Closed:</strong>
                            <br />
                            {new Date(ticket.closed_at).toLocaleDateString()}
                            <br />
                            {new Date(ticket.closed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {renderPaginationControls}
            </>
          )}
        </div>

        {/* Additional Dashboard Info */}
        <div className="dashboard-footer">
          <div className="dashboard-info">
            <p>
              Dashboard last refreshed at {lastUpdate.toLocaleTimeString()} •
              Showing {filter === 'my-tickets' ? 'your tickets only' : 'all system tickets'} •
              Auto-refresh every 30 seconds
            </p>
            {stats.last_updated && (
              <small>
                Server data last updated: {new Date(stats.last_updated).toLocaleTimeString()}
              </small>
            )}
          </div>
        </div>

        {/* Professional Report Modal */}
        {showProfessionalReport && (
          <div className="modal-overlay" onClick={() => setShowProfessionalReport(false)} style={{ zIndex: 2000 }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '95%', width: '1200px', maxHeight: '90vh', overflow: 'auto' }}>
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <h3>Professional Ticket Report</h3>
                <button className="modal-close" onClick={() => setShowProfessionalReport(false)} style={{ color: 'white' }}>×</button>
              </div>
              <div className="modal-body" style={{ padding: '40px', background: '#f9fafb' }}>
                {/* Report Header */}
                <div style={{ background: 'white', padding: '30px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h1 style={{ fontSize: '32px', color: '#1f2937', marginBottom: '8px' }}>AGS ROCC TEAM</h1>
                      <p style={{ color: '#6b7280', fontSize: '16px' }}>Solar Asset Management System</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>Report Generated</div>
                      <div style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginTop: '24px' }}>
                    <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e40af' }}>{filteredTickets.length}</div>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>Total Tickets</div>
                    </div>
                    <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: '#15803d' }}>{filteredTickets.filter(t => t.ticket_status?.toLowerCase() === 'closed').length}</div>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>Closed</div>
                    </div>
                    <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: '#92400e' }}>{filteredTickets.filter(t => t.ticket_status?.toLowerCase() === 'pending').length}</div>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>Pending</div>
                    </div>
                    <div style={{ background: '#dbeafe', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e40af' }}>{filteredTickets.filter(t => t.ticket_status?.toLowerCase() === 'open').length}</div>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>Open</div>
                    </div>
                  </div>
                </div>

                {/* Professional Table */}
                <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Created Date</th>
                        <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Ticket #</th>
                        <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Site</th>
                        <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Equipment</th>
                        <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Category</th>
                        <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Description</th>
                        <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Priority</th>
                        <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Site Outage</th>
                        <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Status</th>
                        <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Requestor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTickets.map((ticket, index) => (
                        <tr key={ticket.id} style={{ background: index % 2 === 0 ? 'white' : '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '14px 12px', fontSize: '13px', color: '#374151' }}>{formatDate(ticket.created_at)}</td>
                          <td style={{ padding: '14px 12px', fontSize: '13px', fontWeight: '600', color: '#3b82f6' }}>{ticket.ticket_number || 'N/A'}</td>
                          <td style={{ padding: '14px 12px', fontSize: '13px', color: '#374151' }}>{ticket.site_name || 'N/A'}</td>
                          <td style={{ padding: '14px 12px', fontSize: '13px', color: '#374151' }}>{ticket.equipment || 'N/A'}</td>
                          <td style={{ padding: '14px 12px', fontSize: '12px' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '12px',
                              background: '#f3f4f6',
                              color: '#374151',
                              fontWeight: '500'
                            }}>
                              {ticket.category || 'Other'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 12px', fontSize: '13px', color: '#6b7280' }}>
                            <div className="description-text">
                              {ticket.issue_description || 'No description'}
                            </div>
                          </td>
                          <td style={{ padding: '14px 12px', fontSize: '12px' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '12px',
                              background: ticket.priority?.toLowerCase() === 'urgent' ? '#fee2e2' :
                                ticket.priority?.toLowerCase() === 'high' ? '#fef3c7' :
                                  ticket.priority?.toLowerCase() === 'medium' ? '#dbeafe' : '#f0fdf4',
                              color: ticket.priority?.toLowerCase() === 'urgent' ? '#991b1b' :
                                ticket.priority?.toLowerCase() === 'high' ? '#92400e' :
                                  ticket.priority?.toLowerCase() === 'medium' ? '#1e40af' : '#15803d',
                              fontWeight: '600',
                              textTransform: 'uppercase'
                            }}>
                              {ticket.priority || 'Medium'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 12px', fontSize: '12px' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '12px',
                              background: ticket.site_outage?.toLowerCase() === 'yes' ? '#fee2e2' : '#f0fdf4',
                              color: ticket.site_outage?.toLowerCase() === 'yes' ? '#991b1b' : '#15803d',
                              fontWeight: '600'
                            }}>
                              {ticket.site_outage || 'No'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 12px', fontSize: '12px' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '12px',
                              background: ticket.ticket_status?.toLowerCase() === 'closed' ? '#d1fae5' :
                                ticket.ticket_status?.toLowerCase() === 'open' ? '#dbeafe' :
                                  ticket.ticket_status?.toLowerCase() === 'pending' ? '#fef3c7' : '#f3f4f6',
                              color: ticket.ticket_status?.toLowerCase() === 'closed' ? '#065f46' :
                                ticket.ticket_status?.toLowerCase() === 'open' ? '#1e40af' :
                                  ticket.ticket_status?.toLowerCase() === 'pending' ? '#92400e' : '#374151',
                              fontWeight: '600',
                              textTransform: 'uppercase'
                            }}>
                              {ticket.ticket_status || 'Open'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 12px', fontSize: '13px', color: '#374151' }}>{ticket.users?.name || ticket.created_by_name || 'Unknown'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                <div style={{ marginTop: '30px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                  <p>Report generated on {new Date().toLocaleString()}</p>
                  <p style={{ marginTop: '8px' }}>© {new Date().getFullYear()} AGS ROCC Team - Solar Asset Management System</p>
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb', padding: '20px', background: 'white', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-outline"
                  onClick={() => window.print()}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  Print Report
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowProfessionalReport(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CSV Export Modal */}
        {showExportModal && (
          <div className="modal-overlay" onClick={handleExportCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Export Tickets to CSV</h3>
                <button className="modal-close" onClick={handleExportCancel}>×</button>
              </div>
              <div className="modal-body">
                <p style={{ marginBottom: '20px', color: '#666' }}>
                  Select a date range to filter tickets for export. Leave blank to export all {filteredTickets.length} tickets.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Start Date (Optional)
                    </label>
                    <input
                      type="date"
                      className="filter-input date-input"
                      value={exportDateRange.startDate}
                      onChange={(e) => setExportDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      className="filter-input date-input"
                      value={exportDateRange.endDate}
                      onChange={(e) => setExportDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                      style={{ width: '100%' }}
                    />
                  </div>

                  {(exportDateRange.startDate || exportDateRange.endDate) && (
                    <div style={{
                      padding: '10px',
                      backgroundColor: '#f0f9ff',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#0369a1'
                    }}>
                      <strong>Preview:</strong> Will export tickets created
                      {exportDateRange.startDate && ` from ${new Date(exportDateRange.startDate).toLocaleDateString()}`}
                      {exportDateRange.endDate && ` to ${new Date(exportDateRange.endDate).toLocaleDateString()}`}
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-outline"
                  onClick={handleExportCancel}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={exportToCSV}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  Export CSV
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
