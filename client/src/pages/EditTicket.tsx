import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import BackButton from '../components/BackButton';

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
  };
}

const EditTicket: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [originalTicket, setOriginalTicket] = useState<Ticket | null>(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerType: '',
    assetName: '',
    siteName: '',
    equipment: '',
    category: '',
    siteOutage: '',
    ticketStatus: '',
    issueStartTime: '',
    issueEndTime: '',
    totalDuration: '',
    kwDown: '',
    caseNumber: '',
    issueDescription: '',
    additionalNotes: '',
    closedAt: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Customer Type Options
  const customerTypes = ['Puresky', 'Metlen'];
  
  // Site Options
  const siteOptions = ['Site 1', 'Site 2'];
  
  // Equipment Options
  const equipmentOptions = [
    'Production Meter',
    'Inverter', 
    'Combining Box/String Box',
    'Weather Station',
    'Tracker'
  ];

  // Category Options
  const categoryOptions = [
    'Production Impacting',
    'Communication Issues',
    'Cannot Confirm Production'
  ];

  // Site Outage Options
  const siteOutageOptions = ['Yes', 'No', 'TBD (To be decided)'];

  // Ticket Status Options
  const ticketStatusOptions = ['Open', 'Resolved', 'Pending', 'Closed'];

  // Fetch ticket data
  useEffect(() => {
    if (id) {
      fetchTicket();
    }
  }, [id]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tickets/${id}`);
      const ticket = response.data;
      
      setOriginalTicket(ticket);
      
      // Convert ticket data to form format
      setFormData({
        customerName: ticket.customer_name || '',
        customerType: ticket.customer_type || '',
        assetName: ticket.asset_name || '',
        siteName: ticket.site_name || '',
        equipment: ticket.equipment || '',
        category: ticket.category || '',
        siteOutage: ticket.site_outage || '',
        ticketStatus: ticket.ticket_status || '',
        issueStartTime: ticket.issue_start_time ? 
          new Date(ticket.issue_start_time).toISOString().slice(0, 16) : '',
        issueEndTime: ticket.issue_end_time ? 
          new Date(ticket.issue_end_time).toISOString().slice(0, 16) : '',
        totalDuration: ticket.total_duration || '',
        kwDown: ticket.kw_down?.toString() || '',
        caseNumber: ticket.case_number || '',
        issueDescription: ticket.issue_description || '',
        additionalNotes: ticket.additional_notes || '',
        closedAt: ticket.closed_at ? 
          new Date(ticket.closed_at).toISOString().slice(0, 16) : ''
      });
      
    } catch (error: any) {
      console.error('Error fetching ticket:', error);
      setError('Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total duration when start and end times change
  useEffect(() => {
    if (formData.issueStartTime && formData.issueEndTime) {
      const startTime = new Date(formData.issueStartTime);
      const endTime = new Date(formData.issueEndTime);
      const diffInMilliseconds = endTime.getTime() - startTime.getTime();
      const diffInHours = diffInMilliseconds / (1000 * 60 * 60);
      
      if (diffInHours > 0) {
        const hours = Math.floor(diffInHours);
        const minutes = Math.floor((diffInHours - hours) * 60);
        setFormData(prev => ({
          ...prev,
          totalDuration: `${hours}h ${minutes}m`
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          totalDuration: ''
        }));
      }
    }
  }, [formData.issueStartTime, formData.issueEndTime]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStatusChange = (newStatus: string) => {
    setFormData(prev => ({
      ...prev,
      ticketStatus: newStatus,
      // Auto-set closed date when status changes to Closed or Resolved
      closedAt: (newStatus === 'Closed' || newStatus === 'Resolved') && !prev.closedAt ? 
        new Date().toISOString().slice(0, 16) : 
        (newStatus !== 'Closed' && newStatus !== 'Resolved') ? '' : prev.closedAt
    }));
  };

  const handlePreview = () => {
    // Validate required fields
    if (!formData.customerName || !formData.customerType || !formData.siteName || 
        !formData.equipment || !formData.category || !formData.siteOutage || 
        !formData.issueStartTime || !formData.issueDescription) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Validate end time logic only if end time is provided
    if (formData.issueStartTime && formData.issueEndTime) {
      const startTime = new Date(formData.issueStartTime);
      const endTime = new Date(formData.issueEndTime);
      if (endTime <= startTime) {
        setError('Issue end time must be after start time');
        return;
      }
    }
    
    setError('');
    setShowPreview(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');

      // Prepare data for API
      const ticketData = {
        customer_name: formData.customerName,
        customer_type: formData.customerType,
        asset_name: formData.assetName,
        site_name: formData.siteName,
        equipment: formData.equipment,
        category: formData.category,
        site_outage: formData.siteOutage,
        ticket_status: formData.ticketStatus,
        issue_start_time: formData.issueStartTime,
        issue_end_time: formData.issueEndTime || null,
        kw_down: formData.kwDown ? parseFloat(formData.kwDown) : null,
        case_number: formData.caseNumber,
        issue_description: formData.issueDescription,
        additional_notes: formData.additionalNotes,
        closed_at: formData.closedAt || null
      };

      console.log('Updating ticket with data:', ticketData);
      const response = await api.put(`/tickets/${id}`, ticketData);
      
      console.log('Ticket updated successfully:', response.data);
      
      // Show success message
      alert(`Ticket updated successfully!`);
      
      // Navigate back to ticket detail
      navigate(`/tickets/${id}`);
      
    } catch (err: any) {
      console.error('Error updating ticket:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to update ticket');
    } finally {
      setSaving(false);
    }
  };

  const PreviewModal = () => (
    <div className="preview-overlay" onClick={() => setShowPreview(false)}>
      <div className="preview-modal" onClick={e => e.stopPropagation()}>
        <div className="preview-header">
          <h3>Update Preview</h3>
          <button className="close-btn" onClick={() => setShowPreview(false)}>×</button>
        </div>
        <div className="preview-content">
          <div className="preview-row">
            <span className="preview-label">Customer Name:</span>
            <span className="preview-value">{formData.customerName}</span>
          </div>
          <div className="preview-row">
            <span className="preview-label">Customer Type:</span>
            <span className="preview-value">{formData.customerType}</span>
          </div>
          <div className="preview-row">
            <span className="preview-label">Site:</span>
            <span className="preview-value">{formData.siteName}</span>
          </div>
          <div className="preview-row">
            <span className="preview-label">Equipment:</span>
            <span className="preview-value">{formData.equipment}</span>
          </div>
          <div className="preview-row">
            <span className="preview-label">Category:</span>
            <span className="preview-value">{formData.category}</span>
          </div>
          <div className="preview-row">
            <span className="preview-label">Site Outage:</span>
            <span className="preview-value">{formData.siteOutage}</span>
          </div>
          <div className="preview-row">
            <span className="preview-label">Ticket Status:</span>
            <span className="preview-value">{formData.ticketStatus}</span>
          </div>
          <div className="preview-row">
            <span className="preview-label">Issue Duration:</span>
            <span className="preview-value">{formData.totalDuration}</span>
          </div>
          <div className="preview-row">
            <span className="preview-label">KW Down:</span>
            <span className="preview-value">{formData.kwDown || 'Not specified'}</span>
          </div>
          <div className="preview-row">
            <span className="preview-label">Case Number:</span>
            <span className="preview-value">{formData.caseNumber || 'Not specified'}</span>
          </div>
          {formData.closedAt && (
            <div className="preview-row">
              <span className="preview-label">Closed Date:</span>
              <span className="preview-value">
                {new Date(formData.closedAt).toLocaleString()}
              </span>
            </div>
          )}
          <div className="preview-row">
            <span className="preview-label">Issue Description:</span>
            <span className="preview-value">{formData.issueDescription}</span>
          </div>
          {formData.additionalNotes && (
            <div className="preview-row">
              <span className="preview-label">Additional Notes:</span>
              <span className="preview-value">{formData.additionalNotes}</span>
            </div>
          )}
        </div>
        <div className="preview-actions">
          <button className="btn btn-secondary" onClick={() => setShowPreview(false)}>
            Continue Editing
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (!originalTicket) {
    return (
      <div className="page">
        <div className="form-container">
          <div className="form-card">
            <h2>Ticket not found</h2>
            <p>The ticket you're trying to edit doesn't exist.</p>
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="form-container">
        <div className="form-card">
          <div className="form-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <BackButton label="Back" />
              <h1 className="form-title" style={{ margin: 0 }}>Edit Ticket #{originalTicket.ticket_number}</h1>
            </div>
            <div className="form-actions">
              <button 
                onClick={() => navigate(`/tickets/${id}`)}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="form-content">
            {/* Row 1: Customer Name */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Customer Name <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  placeholder="Customer name"
                />
              </div>
            </div>

            {/* Row 2: Customer Type */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Customer Type <span className="required">*</span></label>
                <div className="button-group">
                  {customerTypes.map(type => (
                    <button
                      key={type}
                      type="button"
                      className={`option-btn ${formData.customerType === type ? 'active' : ''}`}
                      onClick={() => handleInputChange('customerType', type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 3: Site Selection */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Site <span className="required">*</span></label>
                <div className="button-group">
                  {siteOptions.map(site => (
                    <button
                      key={site}
                      type="button"
                      className={`option-btn ${formData.siteName === site ? 'active' : ''}`}
                      onClick={() => handleInputChange('siteName', site)}
                    >
                      {site}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 4: Equipment, Category, Site Outage, Ticket Status */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Equipment <span className="required">*</span></label>
                <select
                  className="form-select"
                  value={formData.equipment}
                  onChange={(e) => handleInputChange('equipment', e.target.value)}
                >
                  <option value="">Select Equipment</option>
                  {equipmentOptions.map(equipment => (
                    <option key={equipment} value={equipment}>{equipment}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Category <span className="required">*</span></label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  <option value="">Select Category</option>
                  {categoryOptions.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Site Outage <span className="required">*</span></label>
                <select
                  className="form-select"
                  value={formData.siteOutage}
                  onChange={(e) => handleInputChange('siteOutage', e.target.value)}
                >
                  <option value="">Select Status</option>
                  {siteOutageOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Ticket Status</label>
                <select
                  className="form-select"
                  value={formData.ticketStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  {ticketStatusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 5: Time and Duration */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Issue Start Time <span className="required">*</span></label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={formData.issueStartTime}
                  onChange={(e) => handleInputChange('issueStartTime', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Issue End Time</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={formData.issueEndTime}
                  onChange={(e) => handleInputChange('issueEndTime', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total Duration</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.totalDuration}
                  placeholder="Auto-calculated"
                  disabled
                />
              </div>
            </div>

            {/* Row 6: KW Down, Case Number, and Closed Date */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">KW Down</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.kwDown}
                  onChange={(e) => handleInputChange('kwDown', e.target.value)}
                  placeholder="Enter KW value"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Case Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.caseNumber}
                  onChange={(e) => handleInputChange('caseNumber', e.target.value)}
                  placeholder="Enter case number"
                />
              </div>

              {(formData.ticketStatus === 'Closed' || formData.ticketStatus === 'Resolved') && (
                <div className="form-group">
                  <label className="form-label">Closed Date</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={formData.closedAt}
                    onChange={(e) => handleInputChange('closedAt', e.target.value)}
                    placeholder="Date when issue was resolved"
                  />
                </div>
              )}
            </div>

            {/* Row 7: Issue Description */}
            <div className="form-row">
              <div className="form-group full-width">
                <label className="form-label">Issue Description <span className="required">*</span></label>
                <textarea
                  className="form-textarea"
                  value={formData.issueDescription}
                  onChange={(e) => handleInputChange('issueDescription', e.target.value)}
                  placeholder="Explain the issue in detail"
                  rows={4}
                />
              </div>
            </div>

            {/* Row 8: Additional Notes */}
            <div className="form-row">
              <div className="form-group full-width">
                <label className="form-label">Additional Notes</label>
                <textarea
                  className="form-textarea"
                  value={formData.additionalNotes}
                  onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                  placeholder="Add any additional points or information"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate(`/tickets/${id}`)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handlePreview}
            >
              Preview Changes
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && <PreviewModal />}
    </div>
  );
};

export default EditTicket;