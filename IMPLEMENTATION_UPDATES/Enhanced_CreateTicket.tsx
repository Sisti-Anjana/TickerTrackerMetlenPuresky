import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface CreateTicketProps {}

interface FormData {
  customer_name: string;
  customer_type: string;
  asset_name: string;
  site_name: string;
  equipment: string;
  category: string;
  site_outage: string;
  ticket_status: string;
  issue_start_time: string;
  issue_end_time: string;
  kw_down: string;
  case_number: string;
  issue_description: string;
  additional_notes: string;
  priority: string;
}

const CreateTicket: React.FC<CreateTicketProps> = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormData>({
    customer_name: user?.name || '',
    customer_type: 'Puresky',
    asset_name: 'Asset 1',
    site_name: '',
    equipment: '',
    category: '',
    site_outage: 'No',
    ticket_status: 'Open',
    issue_start_time: '',
    issue_end_time: '',
    kw_down: '',
    case_number: '',
    issue_description: '',
    additional_notes: '',
    priority: 'Medium'
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load categories and statuses
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        console.log('📋 Loading form metadata...');
        
        const [categoriesRes, statusesRes] = await Promise.all([
          api.get('/tickets/meta/categories'),
          api.get('/tickets/meta/statuses')
        ]);

        const categoryNames = categoriesRes.data.map((cat: any) => cat.name);
        const statusNames = statusesRes.data.map((status: any) => status.name);
        
        setCategories(categoryNames);
        setStatuses(statusNames);
        
        console.log('✅ Metadata loaded:', { categories: categoryNames, statuses: statusNames });
      } catch (error) {
        console.error('❌ Failed to load metadata:', error);
        // Set default values if API fails
        setCategories(['Production Impacting', 'Communication Issues', 'Cannot Confirm Production']);
        setStatuses(['Open', 'Closed', 'Pending']);
      }
    };

    loadMetadata();
  }, []);

  // Update customer name when user changes
  useEffect(() => {
    if (user?.name && !formData.customer_name) {
      setFormData(prev => ({ ...prev, customer_name: user.name }));
    }
  }, [user, formData.customer_name]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.equipment.trim()) errors.push('Equipment is required');
    if (!formData.category) errors.push('Category is required');
    if (!formData.site_name.trim()) errors.push('Site name is required');
    if (!formData.issue_start_time) errors.push('Issue start time is required');
    if (!formData.issue_end_time) errors.push('Issue end time is required');
    if (!formData.issue_description.trim()) errors.push('Issue description is required');
    
    // Validate time logic
    if (formData.issue_start_time && formData.issue_end_time) {
      const startTime = new Date(formData.issue_start_time);
      const endTime = new Date(formData.issue_end_time);
      if (endTime <= startTime) {
        errors.push('Issue end time must be after start time');
      }
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🎫 Creating ticket...');
    console.log('👤 User:', user?.name);
    console.log('📝 Form data:', formData);
    
    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError('Please fix the following errors:\n' + validationErrors.join('\n'));
      return;
    }
    
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Prepare the data for submission
      const ticketData = {
        ...formData,
        user_id: user?.id,
        kw_down: formData.kw_down ? parseFloat(formData.kw_down) : null
      };
      
      console.log('📤 Submitting ticket data:', ticketData);
      
      const response = await api.post('/tickets', ticketData);
      
      console.log('✅ Ticket created successfully:', response.data);
      
      const ticketNumber = response.data.ticket_number;
      setSuccess(`Ticket ${ticketNumber} created successfully! Redirecting to dashboard...`);
      
      // Clear form
      setFormData({
        customer_name: user?.name || '',
        customer_type: 'Puresky',
        asset_name: 'Asset 1',
        site_name: '',
        equipment: '',
        category: '',
        site_outage: 'No',
        ticket_status: 'Open',
        issue_start_time: '',
        issue_end_time: '',
        kw_down: '',
        case_number: '',
        issue_description: '',
        additional_notes: '',
        priority: 'Medium'
      });
      
      // Redirect to dashboard after short delay to show success message
      setTimeout(() => {
        navigate('/dashboard', { 
          state: { 
            message: `Ticket ${ticketNumber} was created successfully!`,
            newTicket: response.data
          }
        });
      }, 2000);
      
    } catch (error: any) {
      console.error('❌ Failed to create ticket:', error);
      
      let errorMessage = 'Failed to create ticket';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.missingFields) {
        errorMessage = 'Missing required fields: ' + error.response.data.missingFields.join(', ');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading user information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Create New Ticket</h1>
        <p className="page-subtitle">
          Welcome {user.name}, create a new solar system ticket
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="alert alert-success">
          <div className="alert-content">
            <strong>✅ Success!</strong> {success}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="alert alert-error">
          <div className="alert-content">
            <strong>⚠️ Error:</strong>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{error}</pre>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="ticket-form">
        {/* Customer Information Section */}
        <div className="form-section">
          <h3 className="section-title">Customer Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="customer_name" className="form-label">Customer Name *</label>
              <input
                type="text"
                id="customer_name"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                className="form-input"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="customer_type" className="form-label">Customer Type</label>
              <select
                id="customer_type"
                name="customer_type"
                value={formData.customer_type}
                onChange={handleChange}
                className="form-input"
                disabled={loading}
              >
                <option value="Puresky">Puresky</option>
                <option value="External">External</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="asset_name" className="form-label">Asset Name</label>
              <input
                type="text"
                id="asset_name"
                name="asset_name"
                value={formData.asset_name}
                onChange={handleChange}
                className="form-input"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="site_name" className="form-label">Site Name *</label>
              <input
                type="text"
                id="site_name"
                name="site_name"
                value={formData.site_name}
                onChange={handleChange}
                className="form-input"
                required
                disabled={loading}
                placeholder="Enter site name"
              />
            </div>
          </div>
        </div>

        {/* Equipment and Category Section */}
        <div className="form-section">
          <h3 className="section-title">Equipment & Category</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="equipment" className="form-label">Equipment *</label>
              <input
                type="text"
                id="equipment"
                name="equipment"
                value={formData.equipment}
                onChange={handleChange}
                className="form-input"
                required
                disabled={loading}
                placeholder="Enter equipment name/model"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="category" className="form-label">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-input"
                required
                disabled={loading}
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="site_outage" className="form-label">Site Outage</label>
              <select
                id="site_outage"
                name="site_outage"
                value={formData.site_outage}
                onChange={handleChange}
                className="form-input"
                disabled={loading}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="Partial">Partial</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="ticket_status" className="form-label">Status</label>
              <select
                id="ticket_status"
                name="ticket_status"
                value={formData.ticket_status}
                onChange={handleChange}
                className="form-input"
                disabled={loading}
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Time and Impact Section */}
        <div className="form-section">
          <h3 className="section-title">Time & Impact</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="issue_start_time" className="form-label">Issue Start Time *</label>
              <input
                type="datetime-local"
                id="issue_start_time"
                name="issue_start_time"
                value={formData.issue_start_time}
                onChange={handleChange}
                className="form-input"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="issue_end_time" className="form-label">Issue End Time *</label>
              <input
                type="datetime-local"
                id="issue_end_time"
                name="issue_end_time"
                value={formData.issue_end_time}
                onChange={handleChange}
                className="form-input"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="kw_down" className="form-label">kW Down</label>
              <input
                type="number"
                id="kw_down"
                name="kw_down"
                value={formData.kw_down}
                onChange={handleChange}
                className="form-input"
                step="0.01"
                min="0"
                disabled={loading}
                placeholder="0.00"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="priority" className="form-label">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="form-input"
                disabled={loading}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="form-section">
          <h3 className="section-title">Additional Information</h3>
          
          <div className="form-group">
            <label htmlFor="case_number" className="form-label">Case Number</label>
            <input
              type="text"
              id="case_number"
              name="case_number"
              value={formData.case_number}
              onChange={handleChange}
              className="form-input"
              disabled={loading}
              placeholder="Enter case number if applicable"
            />
          </div>

          <div className="form-group">
            <label htmlFor="issue_description" className="form-label">Issue Description *</label>
            <textarea
              id="issue_description"
              name="issue_description"
              value={formData.issue_description}
              onChange={handleChange}
              className="form-textarea"
              required
              disabled={loading}
              placeholder="Describe the issue in detail..."
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="additional_notes" className="form-label">Additional Notes</label>
            <textarea
              id="additional_notes"
              name="additional_notes"
              value={formData.additional_notes}
              onChange={handleChange}
              className="form-textarea"
              disabled={loading}
              placeholder="Any additional notes or observations..."
              rows={3}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn btn-outline"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="btn-spinner"></span>
                Creating Ticket...
              </>
            ) : (
              'Create Ticket'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTicket;
