import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import BackButton from '../components/BackButton';
import api from '../services/api';
import '../styles/analytics-users.css';

interface Ticket {
  id: string;
  ticket_status: string;
  category: string;
  priority: string;
  created_at: string;
  issue_description?: string;
}

interface AnalyticsData {
  issuesOverTime: {
    month: string;
    productionImpacting: number;
    communicationLoss: number;
    cannotConfirmedProduction: number;
  }[];
  issueTypesDistribution: {
    productionImpacting: number;
    communicationLoss: number;
    cannotConfirmedProduction: number;
  };
  keyInsights: {
    topInsights: string[];
    bottomInsights: string[];
  };
}

const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    fetchTicketsAndGenerateAnalytics();
  }, []);

  const fetchTicketsAndGenerateAnalytics = async () => {
    try {
      setLoading(true);
      // Fetch real tickets data
      const response = await api.get('/tickets');
      const ticketsData = response.data.tickets || [];
      setTickets(ticketsData);
      
      // Generate analytics from real data
      const analyticsData = generateAnalyticsFromTickets(ticketsData);
      setAnalytics(analyticsData);
    } catch (error: any) {
      console.error('Error fetching tickets for analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const generateAnalyticsFromTickets = (ticketsData: Ticket[]): AnalyticsData => {
    // Group tickets by month
    const monthlyData: { [key: string]: { productionImpacting: number; communicationLoss: number; cannotConfirmedProduction: number } } = {};
    
    ticketsData.forEach(ticket => {
      const date = new Date(ticket.created_at);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { productionImpacting: 0, communicationLoss: 0, cannotConfirmedProduction: 0 };
      }
      
      // Categorize based on real ticket data
      if (ticket.category?.toLowerCase().includes('production') || ticket.priority?.toLowerCase() === 'urgent') {
        monthlyData[monthKey].productionImpacting++;
      } else if (ticket.category?.toLowerCase().includes('communication') || 
                 ticket.issue_description?.toLowerCase().includes('communication')) {
        monthlyData[monthKey].communicationLoss++;
      } else if (ticket.category?.toLowerCase().includes('cannot confirm') || 
                 ticket.issue_description?.toLowerCase().includes('cannot confirm')) {
        monthlyData[monthKey].cannotConfirmedProduction++;
      } else {
        // Default to production impacting if unclear
        monthlyData[monthKey].productionImpacting++;
      }
    });

    // Convert to array format for chart
    const issuesOverTime = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data
    }));

    // Calculate distribution percentages
    const totalTickets = ticketsData.length;
    const productionCount = ticketsData.filter(t => 
      t.category?.toLowerCase().includes('production') || t.priority?.toLowerCase() === 'urgent'
    ).length;
    const communicationCount = ticketsData.filter(t => 
      t.category?.toLowerCase().includes('communication') || 
      t.issue_description?.toLowerCase().includes('communication')
    ).length;
    const cannotConfirmCount = ticketsData.filter(t => 
      t.category?.toLowerCase().includes('cannot confirm') || 
      t.issue_description?.toLowerCase().includes('cannot confirm')
    ).length;

    const issueTypesDistribution = {
      productionImpacting: totalTickets > 0 ? Math.round((productionCount / totalTickets) * 100 * 10) / 10 : 0,
      communicationLoss: totalTickets > 0 ? Math.round((communicationCount / totalTickets) * 100 * 10) / 10 : 0,
      cannotConfirmedProduction: totalTickets > 0 ? Math.round((cannotConfirmCount / totalTickets) * 100 * 10) / 10 : 0
    };

    // Generate insights based on real data
    const peakMonth = issuesOverTime.reduce((prev, current) => 
      (prev.productionImpacting + prev.communicationLoss + prev.cannotConfirmedProduction) > 
      (current.productionImpacting + current.communicationLoss + current.cannotConfirmedProduction) 
        ? prev : current
    );

    const keyInsights = {
      topInsights: [
        `Total of ${totalTickets} tickets analyzed across ${issuesOverTime.length} months`,
        `Peak activity in ${peakMonth?.month || 'recent period'} with ${(peakMonth?.productionImpacting || 0) + (peakMonth?.communicationLoss || 0) + (peakMonth?.cannotConfirmedProduction || 0)} tickets`,
        `Production impacting issues represent ${issueTypesDistribution.productionImpacting}% of all tickets`
      ],
      bottomInsights: [
        `${productionCount} production impacting tickets requiring immediate attention`,
        `${communicationCount} communication-related issues indicating connectivity challenges`,
        `System shows ${ticketsData.filter(t => t.ticket_status?.toLowerCase() === 'open').length} currently open tickets needing resolution`
      ]
    };

    return {
      issuesOverTime,
      issueTypesDistribution,
      keyInsights
    };
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="error-message">
          <h2>Analytics Error</h2>
          <p>{error}</p>
          <button onClick={fetchTicketsAndGenerateAnalytics} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...analytics!.issuesOverTime.map(item => 
    item.productionImpacting + item.communicationLoss + item.cannotConfirmedProduction
  ));

  return (
    <div className="analytics-page">
      <div style={{ marginBottom: '20px', padding: '0 20px' }}>
        <BackButton label="Back to Dashboard" to="/dashboard" />
      </div>
      <div className="analytics-container">
        {analytics && (
          <div className="analytics-layout">
            {/* Issues Over Time Chart - Top Left */}
            <div className="chart-section issues-over-time">
              <h2 className="chart-title">Issues Over Time by Type</h2>
              <div className="chart-legend-horizontal">
                <div className="legend-item">
                  <span className="legend-square production"></span>
                  <span className="legend-text">Production impacting</span>
                </div>
                <div className="legend-item">
                  <span className="legend-square communication"></span>
                  <span className="legend-text">Communication loss</span>
                </div>
                <div className="legend-item">
                  <span className="legend-square cannot-confirm"></span>
                  <span className="legend-text">Cannot confirmed production</span>
                </div>
              </div>
              
              <div className="bar-chart-container">
                <div className="y-axis">
                  <div className="y-tick">60</div>
                  <div className="y-tick">50</div>
                  <div className="y-tick">40</div>
                  <div className="y-tick">30</div>
                  <div className="y-tick">20</div>
                  <div className="y-tick">10</div>
                  <div className="y-tick">0</div>
                </div>
                <div className="chart-area">
                  <div className="stacked-bars">
                    {analytics.issuesOverTime.map((item, index) => {
                      const total = item.productionImpacting + item.communicationLoss + item.cannotConfirmedProduction;
                      const heightPercentage = (total / 60) * 100;
                      
                      return (
                        <div key={index} className="bar-group">
                          <div className="stacked-bar" style={{ height: `${heightPercentage}%` }}>
                            {item.cannotConfirmedProduction > 0 && (
                              <div 
                                className="bar-segment cannot-confirm"
                                style={{ height: `${(item.cannotConfirmedProduction / total) * 100}%` }}
                              >
                                <span className="bar-value">{item.cannotConfirmedProduction}</span>
                              </div>
                            )}
                            {item.communicationLoss > 0 && (
                              <div 
                                className="bar-segment communication"
                                style={{ height: `${(item.communicationLoss / total) * 100}%` }}
                              >
                                <span className="bar-value">{item.communicationLoss}</span>
                              </div>
                            )}
                            {item.productionImpacting > 0 && (
                              <div 
                                className="bar-segment production"
                                style={{ height: `${(item.productionImpacting / total) * 100}%` }}
                              >
                                <span className="bar-value">{item.productionImpacting}</span>
                              </div>
                            )}
                          </div>
                          <div className="x-label">{item.month}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Key Insights - Top Right */}
            <div className="chart-section key-insights-top">
              <h2 className="chart-title">Key Insights</h2>
              <div className="insights-content">
                {analytics.keyInsights.topInsights.map((insight, index) => (
                  <div key={index} className="insight-item">
                    <span className="insight-bullet">•</span>
                    <span className="insight-text">{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Insights - Bottom Left */}
            <div className="chart-section key-insights-bottom">
              <h2 className="chart-title">Key Insights</h2>
              <div className="insights-content">
                {analytics.keyInsights.bottomInsights.map((insight, index) => (
                  <div key={index} className="insight-item">
                    <span className="insight-bullet">•</span>
                    <span className="insight-text">{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Issue Types Distribution - Bottom Right */}
            <div className="chart-section issue-distribution">
              <h2 className="chart-title">Issue Types Distribution</h2>
              <div className="donut-container">
                <div className="donut-chart">
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    <circle
                      cx="100"
                      cy="100"
                      r="60"
                      fill="none"
                      stroke="#5B7BD5"
                      strokeWidth="40"
                      strokeDasharray={`${analytics.issueTypesDistribution.productionImpacting * 3.77} 377`}
                      strokeDashoffset="0"
                      transform="rotate(-90 100 100)"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="60"
                      fill="none"
                      stroke="#70AD47"
                      strokeWidth="40"
                      strokeDasharray={`${analytics.issueTypesDistribution.communicationLoss * 3.77} 377`}
                      strokeDashoffset={`-${analytics.issueTypesDistribution.productionImpacting * 3.77}`}
                      transform="rotate(-90 100 100)"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="60"
                      fill="none"
                      stroke="#FFC000"
                      strokeWidth="40"
                      strokeDasharray={`${analytics.issueTypesDistribution.cannotConfirmedProduction * 3.77} 377`}
                      strokeDashoffset={`-${(analytics.issueTypesDistribution.productionImpacting + analytics.issueTypesDistribution.communicationLoss) * 3.77}`}
                      transform="rotate(-90 100 100)"
                    />
                  </svg>
                  <div className="donut-center">
                    <div className="main-percentage">{analytics.issueTypesDistribution.productionImpacting}%</div>
                  </div>
                </div>
                <div className="distribution-legend">
                  <div className="legend-item">
                    <span className="legend-square production"></span>
                    <span className="legend-text">Production impacting</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-square communication"></span>
                    <span className="legend-text">Communication loss</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-square cannot-confirm"></span>
                    <span className="legend-text">Cannot confirmed production</span>
                  </div>
                  <div className="percentage-label">{analytics.issueTypesDistribution.communicationLoss}%</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;