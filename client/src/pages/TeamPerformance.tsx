import React, { useState, useEffect } from 'react';
import TopHeader from '../components/TopHeader';
import BackButton from '../components/BackButton';
import api from '../services/api';
import '../styles/team-performance.css';
import '../styles/professional-icons.css';

interface Ticket {
  id: string;
  ticket_number?: string;
  ticket_status: string;
  category: string;
  priority: string;
  created_at: string;
  closed_at?: string;
  issue_start_time?: string;
  customer_name?: string;
  site_name?: string;
  equipment?: string;
  users?: {
    name: string;
    email: string;
  };
  user_id?: number;
  created_by_name?: string;
  created_by_email?: string;
}

interface UserPerformance {
  userId: number | string;
  name: string;
  email: string;
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
  pendingTickets: number;
  completedTickets: number;
  avgCaseCreationTime: string;
  productionImpacting: number;
  highPriority: number;
  completionRate: number;
  ticketsThisWeek: number;
  ticketsThisMonth: number;
  ticketsToday: number;
  allTickets: Ticket[];
  todayTickets: Ticket[];
  monthTickets: Ticket[];
  displayTickets: Ticket[];
}

type ViewFilter = 'today' | 'month' | 'all';
type ViewMode = 'cards' | 'table';

const TeamPerformance: React.FC = () => {
  const [userPerformances, setUserPerformances] = useState<UserPerformance[]>([]);
  const [filteredPerformances, setFilteredPerformances] = useState<UserPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUsers, setExpandedUsers] = useState<Set<string | number>>(new Set());
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  
  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'total' | 'completion'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchTeamPerformance();
  }, []);

  useEffect(() => {
    if (userPerformances.length > 0) {
      applyFilters();
      applySearchAndSort();
    }
  }, [viewFilter, dateFilter, searchTerm, sortBy, sortOrder, userPerformances]);

  const fetchTeamPerformance = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tickets');
      const tickets: Ticket[] = response.data.tickets || [];
      
      const performanceData = calculateTeamPerformance(tickets);
      setUserPerformances(performanceData);
    } catch (error) {
      console.error('Error fetching team performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTeamPerformance = (tickets: Ticket[]): UserPerformance[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const userMap = new Map<string, Ticket[]>();
    
    tickets.forEach(ticket => {
      const userName = ticket.users?.name || ticket.created_by_name || ticket.customer_name || 'Unknown User';
      const userEmail = ticket.users?.email || ticket.created_by_email || `${userName.toLowerCase().replace(/\s+/g, '')}@email.com`;
      const userKey = `${userName}|${userEmail}`;
      
      if (!userMap.has(userKey)) {
        userMap.set(userKey, []);
      }
      userMap.get(userKey)!.push(ticket);
    });

    const performances: UserPerformance[] = [];
    
    userMap.forEach((userTickets, userKey) => {
      const [name, email] = userKey.split('|');
      
      const totalTickets = userTickets.length;
      const openTickets = userTickets.filter(t => t.ticket_status?.toLowerCase() === 'open').length;
      const closedTickets = userTickets.filter(t => t.ticket_status?.toLowerCase() === 'closed').length;
      const pendingTickets = userTickets.filter(t => t.ticket_status?.toLowerCase() === 'pending').length;
      const completedTickets = closedTickets;
      
      const productionImpacting = userTickets.filter(t => 
        t.category?.toLowerCase().includes('production') || t.priority?.toLowerCase() === 'urgent'
      ).length;
      
      const highPriority = userTickets.filter(t => 
        t.priority?.toLowerCase() === 'high' || t.priority?.toLowerCase() === 'urgent'
      ).length;
      
      const completionRate = totalTickets > 0 ? Math.round((closedTickets / totalTickets) * 100) : 0;
      
      const todayTickets = userTickets.filter(t => {
        const ticketDate = new Date(t.created_at);
        return ticketDate >= today && ticketDate < tomorrow;
      });
      
      const weekTickets = userTickets.filter(t => {
        const ticketDate = new Date(t.created_at);
        return ticketDate >= weekStart;
      });
      
      const monthTickets = userTickets.filter(t => {
        const ticketDate = new Date(t.created_at);
        return ticketDate >= monthStart;
      });

      let totalCreationMinutes = 0;
      let creationCount = 0;
      userTickets.forEach(ticket => {
        if (ticket.issue_start_time && ticket.created_at) {
          const issueStart = new Date(ticket.issue_start_time).getTime();
          const ticketCreated = new Date(ticket.created_at).getTime();
          const diffMinutes = (ticketCreated - issueStart) / (1000 * 60);
          if (diffMinutes > 0) {
            totalCreationMinutes += diffMinutes;
            creationCount++;
          }
        }
      });
      
      const avgCreationMinutes = creationCount > 0 ? totalCreationMinutes / creationCount : 0;
      const avgCaseCreationTime = avgCreationMinutes > 60 
        ? `${(avgCreationMinutes / 60).toFixed(1)}h`
        : `${Math.round(avgCreationMinutes)}m`;

      performances.push({
        userId: userKey,
        name,
        email,
        totalTickets,
        openTickets,
        closedTickets,
        pendingTickets,
        completedTickets,
        avgCaseCreationTime,
        productionImpacting,
        highPriority,
        completionRate,
        ticketsThisWeek: weekTickets.length,
        ticketsThisMonth: monthTickets.length,
        ticketsToday: todayTickets.length,
        allTickets: userTickets,
        todayTickets,
        monthTickets,
        displayTickets: userTickets
      });
    });

    return performances;
  };

  const applyFilters = () => {
    setUserPerformances(prev => prev.map(user => {
      let filtered = [...user.allTickets];

      if (viewFilter === 'today') {
        filtered = user.todayTickets;
      } else if (viewFilter === 'month') {
        filtered = user.monthTickets;
      }

      if (dateFilter.startDate) {
        const startDate = new Date(dateFilter.startDate);
        filtered = filtered.filter(t => new Date(t.created_at) >= startDate);
      }

      if (dateFilter.endDate) {
        const endDate = new Date(dateFilter.endDate);
        endDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter(t => new Date(t.created_at) <= endDate);
      }

      return { ...user, displayTickets: filtered };
    }));
  };

  const applySearchAndSort = () => {
    let filtered = [...userPerformances];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'total') {
        comparison = a.totalTickets - b.totalTickets;
      } else if (sortBy === 'completion') {
        comparison = a.completionRate - b.completionRate;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredPerformances(filtered);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setDateFilter({ startDate: '', endDate: '' });
    setSortBy('name');
    setSortOrder('asc');
  };

  const hasActiveFilters = () => {
    return searchTerm || dateFilter.startDate || dateFilter.endDate;
  };

  const toggleExpand = (userId: string | number) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderTicketsSection = (performance: UserPerformance) => {
    const displayTickets = performance.displayTickets;

    return (
      <div className="tickets-section">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${viewFilter === 'today' ? 'active' : ''}`}
            onClick={() => setViewFilter('today')}
          >
            Today ({performance.ticketsToday})
          </button>
          <button 
            className={`filter-tab ${viewFilter === 'month' ? 'active' : ''}`}
            onClick={() => setViewFilter('month')}
          >
            This Month ({performance.ticketsThisMonth})
          </button>
          <button 
            className={`filter-tab ${viewFilter === 'all' ? 'active' : ''}`}
            onClick={() => setViewFilter('all')}
          >
            All Tickets ({performance.totalTickets})
          </button>
        </div>

        <div className="date-filters-inline">
          <input
            type="date"
            className="date-input-inline"
            value={dateFilter.startDate}
            onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
          />
          <span>to</span>
          <input
            type="date"
            className="date-input-inline"
            value={dateFilter.endDate}
            onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
          />
          {(dateFilter.startDate || dateFilter.endDate) && (
            <button 
              className="clear-date-btn"
              onClick={() => setDateFilter({ startDate: '', endDate: '' })}
            >
              Clear
            </button>
          )}
        </div>

        <div className="tickets-list">
          {displayTickets.length > 0 ? (
            displayTickets.map((ticket) => (
              <div key={ticket.id} className="ticket-card">
                <div className="ticket-header-row">
                  <div className="ticket-number">{ticket.ticket_number || ticket.id.slice(0, 8)}</div>
                  <div className={`ticket-status status-${ticket.ticket_status?.toLowerCase()}`}>
                    {ticket.ticket_status}
                  </div>
                </div>
                <div className="ticket-date">{formatDate(ticket.created_at)}</div>
                <div className="ticket-details-grid">
                  <div className="ticket-detail">
                    <strong>Site:</strong> {ticket.site_name || 'N/A'}
                  </div>
                  <div className="ticket-detail">
                    <strong>Equipment:</strong> {ticket.equipment || 'N/A'}
                  </div>
                </div>
                <div className="ticket-details-grid">
                  <div className="ticket-detail">
                    <strong>Category:</strong> {ticket.category || 'N/A'}
                  </div>
                  <div className="ticket-detail">
                    <strong>Priority:</strong> {ticket.priority}
                  </div>
                </div>
                {ticket.issue_start_time && (
                  <div className="ticket-detail">
                    <strong>⏱️ CASE CREATION TIME:</strong> {
                      (() => {
                        const start = new Date(ticket.issue_start_time).getTime();
                        const created = new Date(ticket.created_at).getTime();
                        const diffMs = created - start;
                        const hours = Math.floor(diffMs / (1000 * 60 * 60));
                        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                        return `${hours}h ${minutes}m`;
                      })()
                    }
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="no-tickets-message">
              No tickets found for the selected period.
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <TopHeader />
        <div className="team-performance-page">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading team performance data...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopHeader />
      <div className="team-performance-page">
        <div style={{ marginBottom: '20px', padding: '0 20px' }}>
          <BackButton label="Back to Dashboard" to="/dashboard" />
        </div>
        {/* View Toggle Section */}
        <div className="view-toggle-section">
          <div className="view-mode-title">Team Performance Dashboard</div>
          <div className="view-mode-buttons">
            <button 
              className={`view-mode-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
            >
              <span className="btn-icon">▦</span> Card View
            </button>
            <button 
              className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <span className="btn-icon">☰</span> Table View
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label className="filter-label">Search by Name or Email</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">From Date</label>
              <input
                type="date"
                className="filter-input"
                value={dateFilter.startDate}
                onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">To Date</label>
              <input
                type="date"
                className="filter-input"
                value={dateFilter.endDate}
                onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Sort By</label>
              <select
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="name">Name (A-Z)</option>
                <option value="total">Total Tickets</option>
                <option value="completion">Completion Rate</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Order</label>
              <select
                className="filter-select"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>

            {hasActiveFilters() && (
              <button 
                className="clear-filters-btn"
                onClick={clearAllFilters}
              >
                × Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Cards View */}
        {viewMode === 'cards' && (
          <div className="performance-cards-container">
            {filteredPerformances.map((performance) => {
              const isExpanded = expandedUsers.has(performance.userId);
              const displayTickets = performance.displayTickets;

              return (
                <div key={performance.userId} className="user-performance-card">
                  <div className="user-card-header">
                    <div className="user-initial">{performance.name.charAt(0).toUpperCase()}</div>
                    <div className="user-details">
                      <h3 className="user-name">{performance.name}</h3>
                      <p className="user-email">{performance.email}</p>
                    </div>
                  </div>

                  <div className="stats-grid">
                    <div className="stat-box">
                      <div className="stat-number">{displayTickets.length}</div>
                      <div className="stat-label">TOTAL TICKETS</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-number">{displayTickets.filter(t => t.ticket_status?.toLowerCase() === 'closed').length}</div>
                      <div className="stat-label">COMPLETED</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-number">{displayTickets.filter(t => t.ticket_status?.toLowerCase() === 'open').length}</div>
                      <div className="stat-label">OPEN</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-number">{displayTickets.filter(t => t.ticket_status?.toLowerCase() === 'pending').length}</div>
                      <div className="stat-label">PENDING</div>
                    </div>
                  </div>

                  <div className="completion-section">
                    <div className="completion-label">COMPLETION RATE</div>
                    <div className="completion-value">{performance.completionRate.toFixed(1)}%</div>
                    <div className="completion-bar">
                      <div 
                        className="completion-fill" 
                        style={{ width: `${performance.completionRate}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="additional-stats">
                    <div className="stat-row">
                      <span className="stat-icon-box">!</span>
                      <span className="stat-text">High Priority: {performance.highPriority}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-icon-box">P</span>
                      <span className="stat-text">Production: {performance.productionImpacting}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-icon-box">⏱</span>
                      <span className="stat-text">Avg Case Creation: {performance.avgCaseCreationTime}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-icon-box">T</span>
                      <span className="stat-text">Today: {performance.ticketsToday}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-icon-box">W</span>
                      <span className="stat-text">This Week: {performance.ticketsThisWeek}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-icon-box">M</span>
                      <span className="stat-text">This Month: {performance.ticketsThisMonth}</span>
                    </div>
                  </div>

                  <button 
                    className={`toggle-tickets-btn ${isExpanded ? 'hide' : 'view'}`}
                    onClick={() => toggleExpand(performance.userId)}
                  >
                    {isExpanded ? '▲ Hide Tickets' : '▼ View Tickets'}
                  </button>

                  {isExpanded && renderTicketsSection(performance)}
                </div>
              );
            })}
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="table-view-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Total</th>
                  <th>Completed</th>
                  <th>Open</th>
                  <th>Pending</th>
                  <th>Completion Rate</th>
                  <th>High Priority</th>
                  <th>Production</th>
                  <th>Avg Creation</th>
                  <th>Today</th>
                  <th>This Week</th>
                  <th>This Month</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPerformances.map((performance) => {
                  const isExpanded = expandedUsers.has(performance.userId);
                  const displayTickets = performance.displayTickets;

                  return (
                    <React.Fragment key={performance.userId}>
                      <tr>
                        <td>
                          <div className="table-user-cell">
                            <div className="table-user-initial">
                              {performance.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="table-user-info">
                              <div className="table-user-name">{performance.name}</div>
                              <div className="table-user-email">{performance.email}</div>
                            </div>
                          </div>
                        </td>
                        <td><div className="table-number">{displayTickets.length}</div></td>
                        <td><div className="table-number">{displayTickets.filter(t => t.ticket_status?.toLowerCase() === 'closed').length}</div></td>
                        <td><div className="table-number">{displayTickets.filter(t => t.ticket_status?.toLowerCase() === 'open').length}</div></td>
                        <td><div className="table-number">{displayTickets.filter(t => t.ticket_status?.toLowerCase() === 'pending').length}</div></td>
                        <td>
                          <div className="table-completion-cell">
                            <div className="table-completion-bar">
                              <div 
                                className="table-completion-fill" 
                                style={{ width: `${performance.completionRate}%` }}
                              ></div>
                            </div>
                            <div className="table-completion-text">{performance.completionRate}%</div>
                          </div>
                        </td>
                        <td>{performance.highPriority}</td>
                        <td>{performance.productionImpacting}</td>
                        <td>{performance.avgCaseCreationTime}</td>
                        <td>{performance.ticketsToday}</td>
                        <td>{performance.ticketsThisWeek}</td>
                        <td>{performance.ticketsThisMonth}</td>
                        <td>
                          <button 
                            className={`table-expand-btn ${isExpanded ? 'expanded' : ''}`}
                            onClick={() => toggleExpand(performance.userId)}
                          >
                            {isExpanded ? '▲ Hide' : '▼ View'}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="table-expanded-row">
                          <td colSpan={13}>
                            <div className="table-expanded-content">
                              {renderTicketsSection(performance)}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default TeamPerformance;
