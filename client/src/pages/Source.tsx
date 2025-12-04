import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopHeader from '../components/TopHeader';
import BackButton from '../components/BackButton';
import api from '../services/api';
import '../styles/source.css';

interface Ticket {
  id: string;
  ticket_number?: string;
  site_name?: string;
  equipment?: string;
  category?: string;
  ticket_status: string;
  priority: string;
  issue_description?: string;
  created_at: string;
  updated_at?: string;
  customer_name?: string;
  customer_type?: string;
  issue_start_time?: string;
  issue_end_time?: string;
  total_duration?: string;
  kw_down?: number;
  users?: {
    name: string;
  };
  created_by_name?: string;
}

interface SiteData {
  siteName: string;
  tickets: Ticket[];
  openTickets: number;
  closedTickets: number;
  lastUpdate: string;
  status: string;
}

const Source: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientTypes, setClientTypes] = useState<Array<{id: number | string, name: string}>>([]);
  const [loadingClientTypes, setLoadingClientTypes] = useState(true);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
    fetchClientTypes();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tickets');
      const allTickets: Ticket[] = response.data.tickets || [];
      setTickets(allTickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientTypes = async () => {
    try {
      setLoadingClientTypes(true);
      const response = await api.get('/tickets/client-types');
      const clientTypesData = response.data.client_types || [];
      
      // Extract unique client type names from the API response
      const uniqueClientTypes = clientTypesData.map((ct: any) => ({
        id: ct.id,
        name: ct.name
      }));
      
      setClientTypes(uniqueClientTypes);
      console.log('✅ Fetched client types for Source page:', uniqueClientTypes.length);
    } catch (error) {
      console.error('Error fetching client types:', error);
      // Fallback to empty array if API fails
      setClientTypes([]);
    } finally {
      setLoadingClientTypes(false);
    }
  };

  const getClientTicketCount = (clientType: string): number => {
    return tickets.filter(t => 
      t.customer_type === clientType || t.customer_name === clientType
    ).length;
  };

  const filterTicketsByDate = (ticketsList: Ticket[]): Ticket[] => {
    if (!dateFilter.startDate && !dateFilter.endDate) {
      return ticketsList;
    }

    let filtered = [...ticketsList];

    if (dateFilter.startDate) {
      const startDate = new Date(dateFilter.startDate);
      filtered = filtered.filter(t => new Date(t.created_at) >= startDate);
    }

    if (dateFilter.endDate) {
      const endDate = new Date(dateFilter.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(t => new Date(t.created_at) <= endDate);
    }

    return filtered;
  };

  const getSitesData = (): SiteData[] => {
    const clientTickets = tickets.filter(t => 
      t.customer_type === selectedClient || t.customer_name === selectedClient
    );

    const filteredTickets = filterTicketsByDate(clientTickets);

    const siteMap = new Map<string, Ticket[]>();
    
    filteredTickets.forEach(ticket => {
      const site = ticket.site_name || 'Unknown Site';
      if (!siteMap.has(site)) {
        siteMap.set(site, []);
      }
      siteMap.get(site)?.push(ticket);
    });

    return Array.from(siteMap.entries()).map(([siteName, siteTickets]) => {
      const openTickets = siteTickets.filter(t => t.ticket_status?.toLowerCase() === 'open').length;
      const closedTickets = siteTickets.filter(t => t.ticket_status?.toLowerCase() === 'closed').length;
      const latestTicket = siteTickets.reduce((latest, current) => 
        new Date(current.created_at) > new Date(latest.created_at) ? current : latest
      );

      return {
        siteName,
        tickets: siteTickets,
        openTickets,
        closedTickets,
        lastUpdate: new Date(latestTicket.updated_at || latestTicket.created_at).toLocaleDateString(),
        status: openTickets > 0 ? 'open' : 'closed'
      };
    });
  };

  const formatDuration = (startTime?: string, endTime?: string, totalDuration?: string): string => {
    if (totalDuration) return totalDuration;
    
    if (startTime) {
      const start = new Date(startTime);
      const end = endTime ? new Date(endTime) : new Date();
      const diffMs = end.getTime() - start.getTime();
      
      if (diffMs < 0) return 'N/A';
      
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${diffHours}h ${diffMinutes}m`;
    }
    return 'N/A';
  };

  const generateTicketSummary = (ticket: any): string => {
    const status = ticket.ticket_status || 'Unknown';
    const priority = ticket.priority || 'Normal';
    const equipment = ticket.equipment || 'equipment';
    const site = ticket.site_name || 'the site';
    const category = ticket.category || 'general maintenance';
    const kwDown = ticket.kw_down || 0;
    const customer = ticket.customer_name || 'the customer';
    
    // Calculate duration
    let durationText = 'Duration unknown';
    if (ticket.issue_start_time) {
      if (ticket.issue_end_time) {
        const start = new Date(ticket.issue_start_time).getTime();
        const end = new Date(ticket.issue_end_time).getTime();
        const hours = Math.floor((end - start) / (1000 * 60 * 60));
        const minutes = Math.floor(((end - start) % (1000 * 60 * 60)) / (1000 * 60));
        durationText = `${hours} hours and ${minutes} minutes`;
      } else {
        durationText = 'Ongoing';
      }
    }

    // Calculate response time
    let responseText = '';
    if (ticket.issue_start_time && ticket.created_at) {
      const issueStart = new Date(ticket.issue_start_time).getTime();
      const ticketCreated = new Date(ticket.created_at).getTime();
      const responseMinutes = Math.floor((ticketCreated - issueStart) / (1000 * 60));
      const responseHours = Math.floor(responseMinutes / 60);
      const remainingMins = responseMinutes % 60;
      if (responseHours > 0) {
        responseText = `The ticket was created ${responseHours} hours and ${remainingMins} minutes after the issue started. `;
      } else {
        responseText = `The ticket was created ${responseMinutes} minutes after the issue started. `;
      }
    }

    // Build summary based on ticket data
    let summary = `This is a ${priority.toLowerCase()} priority ${status.toLowerCase()} ticket for ${customer} at ${site}. `;
    
    if (ticket.issue_description) {
      summary += `\n\nIssue Details: ${ticket.issue_description}\n\n`;
    }
    
    summary += `The issue involves ${equipment} and is categorized as ${category}. `;
    
    if (kwDown > 0) {
      summary += `This incident has resulted in ${kwDown} KW of power being down, which impacts production capacity. `;
    }
    
    summary += `${responseText}`;
    
    if (status.toLowerCase() === 'closed') {
      summary += `The issue was resolved and the ticket is now closed. Total downtime was ${durationText}.`;
    } else if (status.toLowerCase() === 'open') {
      summary += `The issue is currently being addressed. Current downtime: ${durationText}.`;
    } else if (status.toLowerCase() === 'pending') {
      summary += `The ticket is pending review or action. Current status duration: ${durationText}.`;
    }

    // Add impact assessment
    if (kwDown > 500) {
      summary += `\n\n⚠️ High Impact: Significant power loss detected. Immediate attention recommended.`;
    } else if (kwDown > 0) {
      summary += `\n\n⚡ Moderate Impact: Power loss is affecting site operations.`;
    }

    // Add priority note
    if (priority.toLowerCase() === 'urgent' || priority.toLowerCase() === 'high') {
      summary += `\n\n🔴 Priority Alert: This is a ${priority.toLowerCase()} priority issue requiring immediate attention.`;
    }

    if (ticket.additional_notes) {
      summary += `\n\nAdditional Notes: ${ticket.additional_notes}`;
    }

    return summary;
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

  if (loading || loadingClientTypes) {
    return (
      <>
        <TopHeader />
        <div className="source-container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading source data...</p>
          </div>
        </div>
      </>
    );
  }

  // Client Selection Screen
  if (!selectedClient) {
    return (
      <>
        <TopHeader />
        <div className="source-container">
          <div style={{ marginBottom: '20px' }}>
            <BackButton label="Back to Dashboard" to="/dashboard" />
          </div>
          <div className="client-selection-screen">
            <h1 className="selection-title">Select Client Type</h1>
            <p className="selection-subtitle">Choose a client to view their site data and tickets</p>
            
            <div className="client-options">
              {clientTypes.length === 0 ? (
                <div className="no-clients-message">
                  <p>No client types available. Please add client types in <strong>Client & Site Management</strong> (Admin only).</p>
                </div>
              ) : (
                clientTypes.map(clientType => (
                  <div
                    key={clientType.id}
                    className="client-box"
                    onClick={() => setSelectedClient(clientType.name)}
                  >
                    <div className="client-name">{clientType.name}</div>
                    <div className="client-divider"></div>
                    <div className="client-count">
                      {getClientTicketCount(clientType.name)} tickets
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Site Selection Screen
  const sitesData = getSitesData();
  const selectedSiteData = sitesData.find(s => s.siteName === selectedSite);

  return (
    <>
      <TopHeader />
      <div className="source-container">
        <div className="site-header">
          <h1 className="site-title">{selectedClient} - Site Overview</h1>
          <p className="site-subtitle">Select a site to view detailed ticket information</p>
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
            <BackButton
              label="Back to Client Selection"
              onClick={() => {
                setSelectedClient(null);
                setSelectedSite(null);
                setDateFilter({ startDate: '', endDate: '' });
                setSearchQuery('');
              }}
              className="back-button-primary"
            />
          </div>
        </div>

        {/* Date Filters */}
        <div className="filters-section">
          <div className="filters-row">
            <div className="filters-left-group">
              <div className="filter-group">
                <span className="filter-label">From Date</span>
                <input
                  type="date"
                  className="filter-input"
                  value={dateFilter.startDate}
                  onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                />
              </div>
              <div className="filter-group">
                <span className="filter-label">To Date</span>
                <input
                  type="date"
                  className="filter-input"
                  value={dateFilter.endDate}
                  onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                />
              </div>
              {(dateFilter.startDate || dateFilter.endDate) && (
                <button
                  className="clear-filter-btn"
                  onClick={() => setDateFilter({ startDate: '', endDate: '' })}
                >
                  ✕ Clear
                </button>
              )}
            </div>
            
            <div className="filter-group search-filter-group">
              <span className="filter-label">Search Sites</span>
              <div className="search-input-wrapper">
                <input
                  type="text"
                  className="filter-input search-input"
                  placeholder="Search by site name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="search-icon">🔍</span>
              </div>
            </div>
          </div>
        </div>

        {/* Site Cards Grid */}
        <div className="site-cards-grid">
          {sitesData
            .filter(site => 
              searchQuery === '' || 
              site.siteName.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .length === 0 ? (
              <div className="no-results-message">
                <span className="no-results-icon">🔍</span>
                <h3>No sites found</h3>
                <p>Try adjusting your search or date filters</p>
              </div>
            ) : (
            sitesData
              .filter(site => 
                searchQuery === '' || 
                site.siteName.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map(site => (
            <div
              key={site.siteName}
              className={`site-card ${selectedSite === site.siteName ? 'selected' : ''}`}
              onClick={() => setSelectedSite(selectedSite === site.siteName ? null : site.siteName)}
            >
              <div className="site-card-header">
                <h3 className="site-name-display">{site.siteName}</h3>
                <span className={`site-badge ${site.status}`}>
                  {site.status}
                </span>
              </div>
              
              <div className="site-card-stats">
                <div className="site-stat">
                  <div className="site-stat-value">{site.tickets.length}</div>
                  <div className="site-stat-label">Total</div>
                </div>
                <div className="site-stat">
                  <div className="site-stat-value">{site.openTickets}</div>
                  <div className="site-stat-label">Open</div>
                </div>
                <div className="site-stat">
                  <div className="site-stat-value">{site.closedTickets}</div>
                  <div className="site-stat-label">Closed</div>
                </div>
                <div className="site-stat">
                  <div className="site-stat-value">{site.lastUpdate}</div>
                  <div className="site-stat-label">Last Update</div>
                </div>
              </div>
            </div>
          ))
          )}
        </div>

        {/* Bottom back button to return to client selection */}
        <div style={{ marginTop: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
          <BackButton
            label="Back to Client Selection"
            onClick={() => {
              setSelectedClient(null);
              setSelectedSite(null);
              setDateFilter({ startDate: '', endDate: '' });
              setSearchQuery('');
            }}
            className="back-button-primary"
          />
        </div>

        {/* Detailed View */}
        {selectedSiteData && (
          <div className="detailed-view">
            <div className="detailed-header">
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <BackButton
                  label="Back to Sites"
                  onClick={() => setSelectedSite(null)}
                  className="back-button-secondary"
                />
                <BackButton
                  label="Back to Client Selection"
                  onClick={() => {
                    setSelectedClient(null);
                    setSelectedSite(null);
                    setDateFilter({ startDate: '', endDate: '' });
                    setSearchQuery('');
                  }}
                  className="back-button-secondary"
                />
              </div>
              <h2 className="detailed-title">
                {selectedSiteData.siteName} - Detailed Ticket Data
              </h2>
              <button 
                className="close-detailed-btn"
                onClick={() => setSelectedSite(null)}
              >
                ✕ Close
              </button>
            </div>

            {/* Data Table */}
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Issue Description</th>
                  <th>Equipment</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Category</th>
                  <th>Duration</th>
                  <th>KW Down</th>
                  <th>Created</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {selectedSiteData.tickets.map(ticket => (
                  <React.Fragment key={ticket.id}>
                    <tr>
                      <td><strong>{ticket.ticket_number || ticket.id.slice(0, 8)}</strong></td>
                      <td style={{ maxWidth: '400px' }}>
                        <div style={{ 
                          whiteSpace: 'pre-wrap',
                          wordWrap: 'break-word',
                          color: '#000000',
                          fontWeight: 500,
                          lineHeight: '1.6'
                        }}>
                          {ticket.issue_description || 'No description'}
                        </div>
                      </td>
                      <td>{ticket.equipment || 'N/A'}</td>
                      <td>
                        <span className={`site-badge ${ticket.ticket_status?.toLowerCase()}`}>
                          {ticket.ticket_status}
                        </span>
                      </td>
                      <td>{ticket.priority}</td>
                      <td>{ticket.category || 'N/A'}</td>
                      <td>{formatDuration(ticket.issue_start_time, ticket.issue_end_time, ticket.total_duration)}</td>
                      <td>{ticket.kw_down ? `${ticket.kw_down} KW` : 'N/A'}</td>
                      <td>{formatDate(ticket.created_at)}</td>
                      <td>
                        <button
                          className="detail-arrow-btn"
                          onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
                          title="View Details"
                        >
                          {expandedTicket === ticket.id ? '▼' : '▶'}
                        </button>
                      </td>
                    </tr>
                    {expandedTicket === ticket.id && (
                      <tr className="expanded-detail-row">
                        <td colSpan={10}>
                          <div className="ticket-detail-panel">
                            <h4 className="detail-panel-title">📋 Auto-Generated Ticket Summary - {ticket.ticket_number}</h4>
                            
                            <div className="detail-section full-width">
                              <div className="summary-box">
                                {generateTicketSummary(ticket)}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>

            {/* Detailed Explanation */}
            <div className="detailed-explanation">
              <h3 className="explanation-title">
                📊 Site Analysis & Summary
              </h3>
              <div className="explanation-content">
                <p>
                  <strong>Site Overview:</strong> {selectedSiteData.siteName} has a total of{' '}
                  <strong>{selectedSiteData.tickets.length}</strong> tickets recorded in this period.
                </p>
                <p>
                  <strong>Current Status:</strong> There are currently{' '}
                  <strong>{selectedSiteData.openTickets}</strong> open ticket(s) and{' '}
                  <strong>{selectedSiteData.closedTickets}</strong> closed ticket(s).
                </p>
                <p><strong>Key Insights:</strong></p>
                <ul>
                  <li>
                    Most recent activity: {selectedSiteData.lastUpdate}
                  </li>
                  <li>
                    Resolution rate: {selectedSiteData.tickets.length > 0 
                      ? Math.round((selectedSiteData.closedTickets / selectedSiteData.tickets.length) * 100)
                      : 0}%
                  </li>
                  <li>
                    Total power impact: {selectedSiteData.tickets.reduce((sum, t) => sum + (t.kw_down || 0), 0)} KW
                  </li>
                  <li>
                    Average response time: Based on ticket creation patterns and issue start times
                  </li>
                </ul>
                <p>
                  <strong>Recommendations:</strong> Monitor open tickets closely and prioritize high-priority 
                  issues to minimize downtime and power loss. Regular maintenance checks can help prevent 
                  recurring issues at this site.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Source;
