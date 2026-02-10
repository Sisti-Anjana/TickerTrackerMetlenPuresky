import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import BackButton from '../components/BackButton';
import '../styles/ticket-detail.css';

interface Ticket {
  id: string;
  ticket_number: string;
  customer_name: string;
  customer_type: string;
  site_name: string;
  equipment: string;
  category: string;
  site_outage: string;
  ticket_status: string;
  issue_start_time: string;
  issue_end_time: string;
  kw_down: number;
  case_number: string;
  issue_description: string;
  additional_notes: string;
  priority: string;
  closed_at?: string;
  created_at: string;
  updated_at: string;
  users?: {
    name: string;
    email: string;
  };
}

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  // Status update states
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [closedDate, setClosedDate] = useState('');

  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchHistory();
    }
  }, [id]);

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await api.get(`/tickets/${id}/history`);
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tickets/${id}`);
      setTicket(response.data);
      setSelectedStatus(response.data.ticket_status);
      setClosedDate(response.data.closed_at || '');
    } catch (error: any) {
      console.error('Error fetching ticket:', error);
      setError('Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus) {
      alert('Please select a status');
      return;
    }

    if ((selectedStatus === 'Closed' || selectedStatus === 'Resolved') && !closedDate) {
      alert('Please enter closed date for Closed/Resolved status');
      return;
    }

    // Prepare update data outside try block so it's accessible in catch
    const updateData: any = {
      ticket_status: selectedStatus
    };

    if (closedDate) {
      updateData.closed_at = closedDate;
    }

    try {
      setUpdating(true);
      console.log('Updating ticket status:', { id, selectedStatus, closedDate });
      console.log('Update data:', updateData);

      // Use PUT since PATCH is not supported by backend
      const response = await api.put(`/tickets/${id}`, updateData);

      console.log('Update response:', response.data);

      alert('Status updated successfully! Redirecting to dashboard...');
      setShowStatusDropdown(false);

      // Navigate back to dashboard and force refresh
      navigate('/dashboard', { replace: true });
      window.location.reload(); // Force full page reload to refresh data
    } catch (error: any) {
      console.error('Error updating status:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);

      if (error.response?.status === 403) {
        alert(`Permission denied: ${error.response?.data?.message || 'You may not have permission to update this ticket. Only the ticket owner can update it.'}`);
      } else {
        alert(`Failed to update status: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="ticket-detail-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="ticket-detail-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || 'Ticket not found'}</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) return 'Invalid Date';

      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();

      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';

      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12
      const hoursStr = String(hours).padStart(2, '0');

      return `${month}/${day}/${year} ${hoursStr}:${minutes} ${ampm}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return '#3b82f6';
      case 'pending': return '#f59e0b';
      case 'resolved': return '#10b981';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div className="ticket-detail-page">
      {/* Header */}
      <div className="detail-header">
        <div className="header-left">
          <BackButton label="Back" />
          <h1 className="ticket-title">Ticket Details</h1>
          <span className="ticket-number">{ticket.ticket_number}</span>
        </div>
        <div className="header-right">
          <Link to={`/tickets/${id}/edit`} className="btn btn-outline">
            ✏️ Edit Ticket
          </Link>
        </div>
      </div>

      {/* Status Badge and Info Bar */}
      <div className="status-info-bar">
        <div className="status-badge-container">
          <span
            className="status-badge"
            style={{ backgroundColor: getStatusColor(ticket.ticket_status) }}
          >
            {ticket.ticket_status}
          </span>
          <span
            className="priority-badge"
            style={{ backgroundColor: getPriorityColor(ticket.priority) }}
          >
            {ticket.priority || 'Medium'}
          </span>
        </div>
        <div className="ticket-meta">
          <span>Created: {formatDate(ticket.created_at)}</span>
          <span>•</span>
          <span>Updated: {formatDate(ticket.updated_at)}</span>
        </div>
      </div>

      {/* Status Update Section - Inline */}
      <div className="status-update-section">
        <div className="status-update-inline">
          <h3 className="status-update-title">Update Status</h3>

          <div className="status-form-inline">
            <div className="form-group-compact">
              <label>Current Status:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="status-select-compact"
              >
                <option value="Open">Open</option>
                <option value="Pending">Pending</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {selectedStatus === 'Closed' && (
              <div className="form-group-compact">
                <label>Closed Date & Time:</label>
                <input
                  type="datetime-local"
                  value={closedDate}
                  onChange={(e) => setClosedDate(e.target.value)}
                  className="date-input-compact"
                />
              </div>
            )}

            <button
              onClick={handleStatusUpdate}
              disabled={updating}
              className="btn btn-primary update-btn-compact"
            >
              {updating ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="detail-content">
        {/* Ticket Information - NEW */}
        <div className="info-card">
          <div className="card-header">
            <span className="card-icon">🎫</span>
            <h3 className="card-title">Ticket Information</h3>
          </div>
          <div className="card-content">
            <div className="info-row">
              <span className="info-label">Ticket Number:</span>
              <span className="info-value">{ticket.ticket_number}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Created At:</span>
              <span className="info-value">{formatDate(ticket.created_at)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Last Updated:</span>
              <span className="info-value">{formatDate(ticket.updated_at)}</span>
            </div>
            {ticket.users && (
              <div className="info-row">
                <span className="info-label">Created By:</span>
                <span className="info-value">{ticket.users.name} ({ticket.users.email})</span>
              </div>
            )}
          </div>
        </div>

        {/* Creator Information */}
        <div className="info-card">
          <div className="card-header">
            <span className="card-icon">👤</span>
            <h3 className="card-title">Client Information</h3>
          </div>
          <div className="card-content">
            <div className="info-row">
              <span className="info-label">Customer Name:</span>
              <span className="info-value">{ticket.customer_name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Client Type:</span>
              <span className="info-value">{ticket.customer_type}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Site Name:</span>
              <span className="info-value">{ticket.site_name}</span>
            </div>
          </div>
        </div>

        {/* Equipment Information */}
        <div className="detail-card">
          <h2 className="card-title">
            <span className="card-icon">🔧</span>
            Equipment Information
          </h2>
          <div className="card-content">
            <div className="detail-row">
              <span className="detail-label">Equipment:</span>
              <span className="detail-value">{ticket.equipment}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Category:</span>
              <span className="detail-value">{ticket.category}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Site Outage:</span>
              <span className="detail-value">{ticket.site_outage}</span>
            </div>
          </div>
        </div>

        {/* Issue Timeline */}
        <div className="detail-card">
          <h2 className="card-title">
            <span className="card-icon-pro">Timeline</span>
          </h2>
          <div className="card-content">
            <div className="detail-row">
              <span className="detail-label">Issue Start:</span>
              <span className="detail-value">{formatDate(ticket.issue_start_time)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Issue End:</span>
              <span className="detail-value">{formatDate(ticket.issue_end_time)}</span>
            </div>
            {ticket.closed_at && (
              <div className="detail-row">
                <span className="detail-label">Closed At:</span>
                <span className="detail-value">{formatDate(ticket.closed_at)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Additional Details */}
        <div className="detail-card">
          <h2 className="card-title">
            <span className="card-icon-pro">Details</span>
          </h2>
          <div className="card-content">
            <div className="detail-row">
              <span className="detail-label">KW Down:</span>
              <span className="detail-value">{ticket.kw_down || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Case Number:</span>
              <span className="detail-value">{ticket.case_number || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Priority:</span>
              <span className="detail-value">{ticket.priority || 'Medium'}</span>
            </div>
          </div>
        </div>

        {/* Issue Description - Full Width */}
        <div className="detail-card full-width">
          <h2 className="card-title">
            <span className="card-icon">📝</span>
            Issue Description
          </h2>
          <div className="card-content">
            <p className="description-text">{ticket.issue_description}</p>
          </div>
        </div>

        {/* Additional Notes - Full Width */}
        {ticket.additional_notes && (
          <div className="detail-card full-width">
            <h2 className="card-title">
              <span className="card-icon">💬</span>
              Additional Notes
            </h2>
            <div className="card-content">
              <p className="description-text">{ticket.additional_notes}</p>
            </div>
          </div>
        )}
      </div>

      {/* Ticket History Section */}
      <div className="detail-card full-width" style={{ marginTop: '20px' }}>
        <h2 className="card-title">
          Edit History
        </h2>
        <div className="card-content">
          {historyLoading ? (
            <p>Loading history...</p>
          ) : history.length === 0 ? (
            <p className="no-history">No edit history available for this ticket.</p>
          ) : (
            <div className="history-list">
              {history.map((record: any) => (
                <div key={record.id} className="history-item">
                  <div className="history-header">
                    <span className="history-user">
                      {record.users?.name || 'Unknown User'}
                    </span>
                    <span className="history-date">
                      {formatDate(record.created_at)}
                    </span>
                  </div>

                  <div className="history-reason">
                    <span style={{ fontWeight: '600', color: '#4b5563' }}>Reason: </span>
                    <span>{record.reason || 'No reason provided'}</span>
                  </div>

                  <div className="history-changes">
                    <h4>Changes:</h4>
                    <ul>
                      {Object.keys(record.changes || {}).map(field => (
                        <li key={field}>
                          <span style={{ textTransform: 'capitalize', fontWeight: '500' }}>{field.replace(/_/g, ' ')}:</span>{' '}
                          <span style={{ color: '#ef4444', textDecoration: 'line-through' }}>
                            {String(record.changes[field].old || 'Empty')}
                          </span>
                          {' '}&rarr;{' '}
                          <span style={{ color: '#10b981', fontWeight: '500' }}>
                            {String(record.changes[field].new || 'Empty')}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;