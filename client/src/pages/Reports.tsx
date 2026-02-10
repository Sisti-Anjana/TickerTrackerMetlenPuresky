import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';

import Analytics from './Analytics';
import api from '../services/api';
import '../styles/reports.css';

interface Ticket {
  id: string;
  ticket_status: string;
  category: string;
  priority: string;
  created_at: string;
  closed_at?: string;
  site_name?: string;
  kw_down?: number;
  customer_name?: string;
}

interface SummaryMetrics {
  // Basic counts
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
  pendingTickets: number;
  ticketsThisMonth: number;
  ticketsThisWeek: number;
  ticketsToday: number;

  // Rates and percentages
  resolutionRate: number;
  completionRate: number;
  currentlyOpenRate: number;
  pendingRate: number;
  weeklyClosureRate: number;
  productionImpactRate: number;

  // Time metrics
  avgResponseTime: string;
  avgResolutionTime: string;

  // Priority counts
  urgentPriority: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;

  // Category counts
  productionImpacting: number;
  communicationIssues: number;
  cannotConfirm: number;
  mostCommonCategory: string;

  // Site metrics
  activeSites: number;
  mostActiveSite: string;
  totalKwDown: number;
  avgTicketsPerSite: number;

  // Team metrics
  activeTeamMembers: number;
  avgTicketsPerUser: number;
  activeWorkload: number;
}

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');
  const [metrics, setMetrics] = useState<SummaryMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'summary') {
      fetchMetrics();
    }
  }, [activeTab]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tickets');
      const tickets: Ticket[] = response.data.tickets || [];

      const calculatedMetrics = calculateMetrics(tickets);
      setMetrics(calculatedMetrics);
    } catch (error) {
      console.error('Error fetching tickets for reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (tickets: Ticket[]): SummaryMetrics => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Basic counts
    const totalTickets = tickets.length;
    const openTickets = tickets.filter(t => t.ticket_status?.toLowerCase() === 'open').length;
    const closedTickets = tickets.filter(t => t.ticket_status?.toLowerCase() === 'closed').length;
    const pendingTickets = tickets.filter(t => t.ticket_status?.toLowerCase() === 'pending').length;

    const ticketsToday = tickets.filter(t => new Date(t.created_at) >= today).length;
    const ticketsThisWeek = tickets.filter(t => new Date(t.created_at) >= weekStart).length;
    const ticketsThisMonth = tickets.filter(t => new Date(t.created_at) >= monthStart).length;

    // Rates and percentages
    const resolutionRate = totalTickets > 0 ? (closedTickets / totalTickets) * 100 : 0;
    const completionRate = resolutionRate;
    const currentlyOpenRate = totalTickets > 0 ? (openTickets / totalTickets) * 100 : 0;
    const pendingRate = totalTickets > 0 ? (pendingTickets / totalTickets) * 100 : 0;

    const ticketsClosedThisWeek = tickets.filter(t =>
      t.closed_at && new Date(t.closed_at) >= weekStart
    ).length;
    const weeklyClosureRate = ticketsThisWeek > 0 ? (ticketsClosedThisWeek / ticketsThisWeek) * 100 : 0;

    const productionImpactRate = totalTickets > 0 ? (tickets.filter(t =>
      t.category?.toLowerCase().includes('production')
    ).length / totalTickets) * 100 : 0;

    // Time metrics
    let totalResponseHours = 0;
    let responseCount = 0;
    let totalResolutionHours = 0;
    let resolutionCount = 0;

    tickets.forEach(ticket => {
      if (ticket.closed_at) {
        const created = new Date(ticket.created_at).getTime();
        const closed = new Date(ticket.closed_at).getTime();
        const hours = (closed - created) / (1000 * 60 * 60);
        totalResponseHours += hours;
        totalResolutionHours += hours;
        responseCount++;
        resolutionCount++;
      }
    });

    const avgResponseHours = responseCount > 0 ? totalResponseHours / responseCount : 0;
    const avgResponseTime = `${avgResponseHours.toFixed(1)} hours`;

    const avgResolutionHours = resolutionCount > 0 ? totalResolutionHours / resolutionCount : 0;
    const avgResolutionTime = `${avgResolutionHours.toFixed(1)} hours`;

    // Priority counts
    const urgentPriority = tickets.filter(t => t.priority?.toLowerCase() === 'urgent').length;
    const highPriority = tickets.filter(t => t.priority?.toLowerCase() === 'high').length;
    const mediumPriority = tickets.filter(t => t.priority?.toLowerCase() === 'medium').length;
    const lowPriority = tickets.filter(t => t.priority?.toLowerCase() === 'low').length;

    // Category counts
    const productionImpacting = tickets.filter(t =>
      t.category?.toLowerCase().includes('production')
    ).length;

    const communicationIssues = tickets.filter(t =>
      t.category?.toLowerCase().includes('communication')
    ).length;

    const cannotConfirm = tickets.filter(t =>
      t.category?.toLowerCase().includes('cannot confirm')
    ).length;

    // Find most common category
    const categoryCounts: Record<string, number> = {};
    tickets.forEach(t => {
      if (t.category) {
        categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
      }
    });
    const mostCommonCategory = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Site metrics
    const siteCounts: Record<string, number> = {};
    tickets.forEach(t => {
      if (t.site_name) {
        siteCounts[t.site_name] = (siteCounts[t.site_name] || 0) + 1;
      }
    });

    const activeSites = Object.keys(siteCounts).length;
    const mostActiveSite = Object.entries(siteCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const totalKwDown = tickets.reduce((sum, t) => sum + (t.kw_down || 0), 0);
    const avgTicketsPerSite = activeSites > 0 ? totalTickets / activeSites : 0;

    // Team metrics
    const userSet = new Set();
    tickets.forEach(t => {
      if (t.customer_name) userSet.add(t.customer_name);
    });
    const activeTeamMembers = userSet.size;
    const avgTicketsPerUser = activeTeamMembers > 0 ? totalTickets / activeTeamMembers : 0;
    const activeWorkload = openTickets + pendingTickets;

    return {
      totalTickets,
      openTickets,
      closedTickets,
      pendingTickets,
      ticketsThisMonth,
      ticketsThisWeek,
      ticketsToday,
      resolutionRate,
      completionRate,
      currentlyOpenRate,
      pendingRate,
      weeklyClosureRate,
      productionImpactRate,
      avgResponseTime,
      avgResolutionTime,
      urgentPriority,
      highPriority,
      mediumPriority,
      lowPriority,
      productionImpacting,
      communicationIssues,
      cannotConfirm,
      mostCommonCategory,
      activeSites,
      mostActiveSite,
      totalKwDown,
      avgTicketsPerSite,
      activeTeamMembers,
      avgTicketsPerUser,
      activeWorkload
    };
  };

  return (
    <>


      <div className="reports-page">
        <BackButton label="Back to Dashboard" />

        <div className="reports-container">
          {/* Professional Tab Navigation */}
          <div className="reports-tabs">
            <div className="tab-list">
              <button
                className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                <span className="tab-icon">📈</span>
                <span className="tab-text">Analytics Dashboard - Real-time Performance Metrics</span>
              </button>
              <button
                className={`tab-button ${activeTab === 'summary' ? 'active' : ''}`}
                onClick={() => setActiveTab('summary')}
              >
                <span className="tab-icon">📋</span>
                <span className="tab-text">Executive Summary - Key Performance Indicators</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="reports-content">
            {activeTab === 'analytics' && <Analytics />}

            {activeTab === 'summary' && (
              <div className="summary-content">
                {loading ? (
                  <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading summary data...</p>
                  </div>
                ) : metrics ? (
                  <>
                    <div className="content-intro">
                      <h2>Executive Summary Overview</h2>
                      <p>
                        This executive summary provides a high-level overview of the key performance indicators and operational metrics
                        for the AGS Solar Asset Management System. The data presented below represents <strong>real-time statistics</strong> collected
                        from all ticket management activities, site operations, and team performance across our entire solar infrastructure
                        network. Last updated: {new Date().toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {/* TOP ROW - Key Metrics */}
                    <div className="summary-cards">
                      <div className="summary-card">
                        <div className="card-content">
                          <div className="metric">
                            <span className="metric-value">{metrics.ticketsThisMonth}</span>
                            <span className="metric-label">Total Tickets This Month</span>
                            <span className="metric-info">Across all sites and categories</span>
                          </div>
                        </div>
                      </div>

                      <div className="summary-card">
                        <div className="card-content">
                          <div className="metric">
                            <span className="metric-value">{metrics.closedTickets}</span>
                            <span className="metric-label">Closed Tickets</span>
                            <span className="metric-info">Successfully resolved and closed</span>
                          </div>
                        </div>
                      </div>

                      <div className="summary-card">
                        <div className="card-content">
                          <div className="metric">
                            <span className="metric-value">{metrics.mediumPriority}</span>
                            <span className="metric-label">Medium Priority Tickets</span>
                            <span className="metric-info">Standard issues with normal timelines</span>
                          </div>
                        </div>
                      </div>

                      <div className="summary-card">
                        <div className="card-content">
                          <div className="metric">
                            <span className="metric-value">{metrics.cannotConfirm}</span>
                            <span className="metric-label">Cannot Confirm Production</span>
                            <span className="metric-info">Issues requiring verification and confirmation</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECOND ROW */}
                    <div className="summary-cards">
                      <div className="summary-card">
                        <div className="card-content">
                          <div className="metric">
                            <span className="metric-value">{metrics.ticketsThisWeek}</span>
                            <span className="metric-label">Tickets This Week</span>
                            <span className="metric-info">Weekly activity tracking</span>
                          </div>
                        </div>
                      </div>

                      <div className="summary-card">
                        <div className="card-content">
                          <div className="metric">
                            <span className="metric-value">{metrics.avgResolutionTime}</span>
                            <span className="metric-label">Average Resolution Time</span>
                            <span className="metric-info">Mean time to close tickets</span>
                          </div>
                        </div>
                      </div>

                      <div className="summary-card">
                        <div className="card-content">
                          <div className="metric">
                            <span className="metric-value">{metrics.lowPriority}</span>
                            <span className="metric-label">Low Priority Tickets</span>
                            <span className="metric-info">Non-critical issues or routine maintenance</span>
                          </div>
                        </div>
                      </div>

                      <div className="summary-card">
                        <div className="card-content">
                          <div className="metric">
                            <span className="metric-value">{metrics.mostCommonCategory}</span>
                            <span className="metric-label">Most Common Category</span>
                            <span className="metric-info">Primary issue type requiring attention</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* THIRD ROW */}
                    <div className="summary-cards">
                      <div className="summary-card">
                        <div className="card-content">
                          <div className="metric">
                            <span className="metric-value">{metrics.ticketsToday}</span>
                            <span className="metric-label">Tickets Created Today</span>
                            <span className="metric-info">Today's new issues</span>
                          </div>
                        </div>
                      </div>

                      <div className="summary-card">
                        <div className="card-content">
                          <div className="metric">
                            <span className="metric-value">{metrics.resolutionRate.toFixed(1)}%</span>
                            <span className="metric-label">Overall Resolution Rate</span>
                            <span className="metric-info">{metrics.closedTickets} out of {metrics.totalTickets} tickets successfully resolved</span>
                          </div>
                        </div>
                      </div>

                      <div className="summary-card">
                        <div className="card-content">
                          <div className="metric">
                            <span className="metric-value">{metrics.urgentPriority}</span>
                            <span className="metric-label">Urgent Priority Tickets</span>
                            <span className="metric-info">Requires immediate attention and action</span>
                          </div>
                        </div>
                      </div>

                      <div className="summary-card">
                        <div className="card-content">
                          <div className="metric">
                            <span className="metric-value">{metrics.openTickets}</span>
                            <span className="metric-label">Open Tickets</span>
                            <span className="metric-info">Currently being worked on or awaiting assignment</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION HEADERS ROW */}
                    <div className="section-headers">
                      <div className="section-header-card">
                        <h3>🏗️ Site & Infrastructure Metrics</h3>
                        <p>Infrastructure status and site-level performance metrics across the solar asset network.</p>
                      </div>

                      <div className="section-header-card">
                        <h3>👥 Team & User Activity</h3>
                        <p>Team engagement and user activity metrics showing participation and workload distribution.</p>
                      </div>

                      <div className="section-header-card">
                        <h3>📈 Performance Trends & Insights</h3>
                        <p>Key performance indicators and trend analysis for continuous improvement.</p>
                      </div>

                      <div className="section-header-card">
                        <h3>💚 System Health Status</h3>
                        <p>Overall system health indicators and operational status metrics.</p>
                      </div>
                    </div>

                    {/* METRICS ROW 1 */}
                    <div className="summary-cards">
                      <div className="summary-card">
                        <div className="card-content">
                          <div className="metric">
                            <span className="metric-value">{metrics.activeSites}</span>
                            <span className="metric-label">Active Sites</span>
                            <span className="metric-info">Number of unique sites with ticket activity</span>
                          </div>
                        </div>
                      </div>

                      <div className="summary-card">
                        <div className="card-content">
                          <div className="metric">
                            <span className="metric-value">{metrics.activeTeamMembers}</span>
                            <span className="metric-label">Active Team Members</span>
                            <span className="metric-info">Users who have created tickets</span>
                          </div>
                        </div>
                      </div>

                      <div className="summary-card">
                        <div className="card-content">
                          <div className="metric">
                            <span className="metric-value">{metrics.completionRate.toFixed(1)}%</span>
                            <span className="metric-label">Overall Completion Rate</span>
                            <span className="metric-info">Percentage of all tickets successfully closed</span>
                          </div>
                        </div>
                      </div>

                      <div className="summary-card">
                        <div className="card-content">
                          <div className="metric">
                            <span className="metric-value">{metrics.pendingTickets}</span>
                            <span className="metric-label">Pending Tickets</span>
                            <span className="metric-info">Awaiting customer response or additional information</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* METRICS ROW 2 */}
                    <div className="summary-cards">
                      <div className="summary-card">
                        <div className="card-content">
                          <div className="metric">
                            <span className="metric-value">{metrics.mostActiveSite}</span>
                            <span className="metric-label">Most Active Site</span>
                            <span className="metric-info">Site with highest number of tickets</span>
                          </div>
                        </div>
                      </div>

                      <div className="summary-card">
                        <div className="card-content">
                          <div className="metric">
                            <span className="metric-value">{metrics.avgTicketsPerUser.toFixed(1)}</span>
                            <span className="metric-label">Average Tickets per User</span>
                            <span className="metric-info">Workload distribution across team members</span>
                          </div>
                        </div>
                      </div>

                      <div className="summary-card">
                        <div className="card-content">
                          <div className="metric">
                            <span className="metric-value">{metrics.currentlyOpenRate.toFixed(1)}%</span>
                            <span className="metric-label">Currently Open Rate</span>
                            <span className="metric-info">Percentage of tickets in active status</span>
                          </div>
                        </div>
                      </div>

                      <div className="summary-card">
                        <div className="card-content">
                          <div className="metric">
                            <span className="metric-value">{metrics.highPriority}</span>
                            <span className="metric-label">High Priority Tickets</span>
                            <span className="metric-info">Important issues requiring quick resolution</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* METRICS ROW 3 */}
                    <div className="summary-cards">
                      <div className="summary-card">
                        <div className="card-content">
                          <div className="metric">
                            <span className="metric-value">{metrics.totalKwDown.toFixed(0)} kW</span>
                            <span className="metric-label">Total Capacity Affected</span>
                            <span className="metric-info">Cumulative kW down across all tickets</span>
                          </div>
                        </div>
                      </div>

                      <div className="summary-card">
                        <div className="card-content">
                          <div className="metric">
                            <span className="metric-value">{metrics.activeWorkload}</span>
                            <span className="metric-label">Active Workload</span>
                            <span className="metric-info">Total open and pending tickets requiring attention</span>
                          </div>
                        </div>
                      </div>

                      <div className="summary-card">
                        <div className="card-content">
                          <div className="metric">
                            <span className="metric-value">{metrics.pendingRate.toFixed(1)}%</span>
                            <span className="metric-label">Pending Rate</span>
                            <span className="metric-info">Percentage of tickets awaiting response</span>
                          </div>
                        </div>
                      </div>

                      <div className="summary-card">
                        <div className="card-content">
                          <div className="metric">
                            <span className="metric-value">{metrics.productionImpacting}</span>
                            <span className="metric-label">Production Impacting Issues</span>
                            <span className="metric-info">Issues affecting energy production output</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* METRICS ROW 4 */}
                    <div className="summary-cards">
                      <div className="summary-card">
                        <div className="card-content">
                          <div className="metric">
                            <span className="metric-value">{metrics.avgTicketsPerSite.toFixed(1)}</span>
                            <span className="metric-label">Average Tickets per Site</span>
                            <span className="metric-info">Distribution of issues across sites</span>
                          </div>
                        </div>
                      </div>

                      <div className="summary-card">
                        <div className="card-content">
                          <div className="metric">
                            <span className="metric-value">{metrics.weeklyClosureRate.toFixed(0)}%</span>
                            <span className="metric-label">Weekly Closure Rate</span>
                            <span className="metric-info">Percentage of tickets resolved this week</span>
                          </div>
                        </div>
                      </div>

                      <div className="summary-card">
                        <div className="card-content">
                          <div className="metric">
                            <span className="metric-value">{metrics.productionImpactRate.toFixed(1)}%</span>
                            <span className="metric-label">Production Impact Rate</span>
                            <span className="metric-info">Percentage of tickets affecting production</span>
                          </div>
                        </div>
                      </div>

                      <div className="summary-card">
                        <div className="card-content">
                          <div className="metric">
                            <span className="metric-value">{metrics.communicationIssues}</span>
                            <span className="metric-label">Communication Issues</span>
                            <span className="metric-info">Connectivity and data transmission problems</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="content-footer">
                      <h3>Report Generation & Data Export</h3>
                      <p>
                        All metrics and statistics presented in this dashboard are updated in <strong>real-time</strong> based on actual ticket data from the system.
                        The report automatically recalculates when new tickets are created or existing tickets are updated. This ensures you always have the most current operational insights.
                        For detailed analytics and historical trend analysis, please refer to the Analytics Dashboard tab above.
                        The system tracks <strong>{metrics.totalTickets} total tickets</strong> across <strong>{metrics.activeSites} sites</strong> with <strong>{metrics.activeTeamMembers} active team members</strong> contributing to ticket management and resolution.
                      </p>
                      <div style={{ marginTop: '16px', padding: '12px', background: '#f0f7e8', borderRadius: '8px', borderLeft: '4px solid #76ab3f' }}>
                        <strong>📊 Quick Summary:</strong> Resolution rate of {metrics.resolutionRate.toFixed(1)}% with {metrics.openTickets} open tickets and {metrics.closedTickets} resolved.
                        {metrics.urgentPriority > 0 && ` ${metrics.urgentPriority} urgent tickets require immediate attention.`}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="empty-state">
                    <h3>No Data Available</h3>
                    <p>Unable to load summary metrics</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Reports;
