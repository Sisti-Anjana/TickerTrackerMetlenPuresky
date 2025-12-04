import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import TopHeader from '../components/TopHeader';
import BackButton from '../components/BackButton';
import '../styles/create-ticket.css';

interface Category {
  id: number;
  name: string;
}

interface Status {
  id: number;
  name: string;
}

const CreateTicket: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    customerType: '',
    customerTypeId: '', // Store the ID separately for the select
    siteName: '',
    equipment: '',
    category: '',
    priority: 'Medium', // Set default priority
    siteOutage: 'No', // Set default
    ticketStatus: 'Open',
    issueStartTime: '',
    issueEndTime: '', // User enters manually
    issueDuration: '', // Auto-calculated from start to NOW
    kwDown: '',
    caseNumber: '',
    issueDescription: '',
    additionalNotes: ''
  });

  const [showSiteName, setShowSiteName] = useState(false);
  const [showEquipment, setShowEquipment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  
  // Client Types and Sites from API
  const [clientTypes, setClientTypes] = useState<Array<{id: number, name: string, sites: Array<{id: number, name: string, location?: string, client_type_id?: number}>}>>([]);
  const [siteOptions, setSiteOptions] = useState<Array<{id: number, name: string, location?: string, client_type_id?: number}>>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [errorCount, setErrorCount] = useState(0);

  // Calculate Issue Duration from start time to closed time (or current time if not closed)
  const calculateIssueDuration = (startTime: string, endTime?: string): string => {
    if (!startTime) return '';
    
    const start = new Date(startTime);
    // If endTime (closed_at) is provided, use it; otherwise use current time
    const end = endTime ? new Date(endTime) : new Date();
    
    const diffMs = end.getTime() - start.getTime();
    
    if (diffMs < 0) return 'Start time is in the future';
    
    const diffMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // Auto-calculate duration when start time changes
  useEffect(() => {
    if (formData.issueStartTime) {
      // Use issueEndTime if provided (when user manually enters closed time)
      const duration = calculateIssueDuration(formData.issueStartTime, formData.issueEndTime);
      setFormData(prev => ({ ...prev, issueDuration: duration }));
    }
  }, [formData.issueStartTime, formData.issueEndTime]); // Include issueEndTime in dependencies
  
  // Equipment Options (default list, can be overridden by API)
  const [equipmentOptions, setEquipmentOptions] = useState<string[]>([
    'Entire Site / Site Level',
    'BESS Side',
    'PV Side',
    'Production Meter',
    'Inverter',
    'Combining Box/String Box',
    'Weather Station',
    'Solar Trackers'
  ]);

  // Category Options
  const categoryOptions = [
    'Production Impacting',
    'Communication Issues',
    'Cannot Confirm Production'
  ];

  // Priority Options
  const priorityOptions = ['Urgent', 'High', 'Medium', 'Low'];

  // Site Outage Options
  const siteOutageOptions = ['Yes', 'No', 'TBD (To be decided)'];

  // Ticket Status Options
  const ticketStatusOptions = ['Open', 'Resolved', 'Pending', 'Closed'];

  // Load equipment options from API (if table exists)
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await api.get('/equipment');
        const apiEquipment = (response.data?.equipment || []) as Array<{ name: string }>;
        const names = apiEquipment
          .map((e) => e.name)
          .filter((n) => !!n && typeof n === 'string');
        if (names.length > 0) {
          setEquipmentOptions(names);
        }
      } catch (err) {
        console.warn('Equipment API not available, using default list.', err);
      }
    };
    fetchEquipment();
  }, []);

  // Update customer name when user changes
  useEffect(() => {
    if (user?.name) {
      setFormData(prev => ({
        ...prev,
        customerName: user.name
      }));
    }
  }, [user]);

  // Fetch client types and sites from API
  useEffect(() => {
    // Initial fetch
    fetchClientTypes();
    
    // Refresh client types every 15 seconds to catch new additions from Client & Site Management
    // Only refresh if page is visible (not in background tab)
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchClientTypes();
      }
    }, 15000); // Changed from 3 seconds to 15 seconds
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run on mount

  const fetchClientTypes = async () => {
    try {
      // Only show loading on first load, not on refreshes
      if (clientTypes.length === 0 && !loadingClients) {
        setLoadingClients(true);
      }
      
      const response = await api.get('/tickets/client-types');
      const clientTypesData = response.data.client_types || [];
      
      // Log client types and their sites for debugging
      console.log('✅ Fetched client types from Client & Site Management:');
      console.log('✅ Total client types:', clientTypesData.length);
      clientTypesData.forEach((ct: any) => {
        const siteCount = ct.sites?.length || 0;
        console.log(`  - ${ct.name} (ID: ${ct.id}): ${siteCount} site(s)`);
        if (siteCount > 0) {
          ct.sites.forEach((site: any) => {
            console.log(`    • ${site.name}${site.location ? ` (${site.location})` : ''} (client_type_id: ${site.client_type_id})`);
          });
        } else {
          console.warn(`    ⚠️ No sites for ${ct.name} (ID: ${ct.id})`);
        }
      });
      
      // Ensure data structure is correct - preserve all site data
      const formattedClientTypes = clientTypesData.map((ct: any) => {
        const sites = (ct.sites || []).map((site: any) => ({
          id: site.id,
          name: site.name,
          location: site.location || null,
          status: site.status || 'active',
          client_type_id: site.client_type_id
        }));
        
        // Log if client has no sites
        if (sites.length === 0 && clientTypes.length === 0) {
          console.log(`⚠️ Client type "${ct.name}" has no sites`);
        }
        
        return {
          id: ct.id,
          name: ct.name,
          status: ct.status || 'active',
          sites: sites
        };
      });
      
      // Always update to ensure sync (but check if data changed for logging)
      const dataChanged = JSON.stringify(formattedClientTypes) !== JSON.stringify(clientTypes);
      if (dataChanged) {
        console.log('🔄 Client types data changed - updating form');
      }
      
      // Always set the client types to ensure sync
      setClientTypes(formattedClientTypes);
      setErrorCount(0); // Reset error count on success
      
      // If a client type was selected, refresh the sites for it
      if (formData.customerTypeId) {
        // Find by ID (handles both UUID and number)
        const selectedClient = formattedClientTypes.find((ct: any) => {
          return String(ct.id) === String(formData.customerTypeId);
        });
        
        if (selectedClient) {
          // Get ALL sites for the selected client type (not just active ones)
          const sites = selectedClient.sites || [];
          setSiteOptions(sites);
          if (dataChanged) {
            console.log('✅ Refreshed sites for selected client:', selectedClient.name, '- Found', sites.length, 'site(s)');
            if (sites.length > 0) {
              console.log('   Sites:', sites.map((s: any) => s.name).join(', '));
            }
          }
        } else {
          console.warn('⚠️ Selected client type not found in refreshed data. ID:', formData.customerTypeId);
        }
      }
    } catch (err: any) {
      console.error('❌ Error fetching client types:', err);
      // Fallback to empty array if API fails
      setClientTypes([]);
      setErrorCount(prev => {
        const newCount = prev + 1;
        if (newCount >= 5) {
          console.warn('⚠️ Multiple errors fetching client types. This may indicate the tables do not exist yet. Please run the CREATE_CLIENT_SITE_TABLES.sql script in your Supabase database.');
        }
        return newCount;
      });
    } finally {
      // Always set loading to false, even if there was an error
      setLoadingClients(false);
    }
  };

  const handleCustomerTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedClientTypeId = e.target.value;
    
    if (!selectedClientTypeId) {
      setSiteOptions([]);
      setShowSiteName(false);
      setShowEquipment(false);
      return;
    }
    
    // Handle both UUID (string) and integer IDs
    const selectedClient = clientTypes.find(ct => {
      // Compare as strings to handle UUIDs, or convert both to numbers if they're numeric
      const ctId = typeof ct.id === 'number' ? ct.id.toString() : ct.id;
      const selectedId = selectedClientTypeId.toString();
      return ctId === selectedId;
    });
    
    if (!selectedClient) {
      console.error('❌ Client type not found for ID:', selectedClientTypeId);
      console.log('Available client types:', clientTypes.map(ct => ({ id: ct.id, name: ct.name, idType: typeof ct.id })));
      setSiteOptions([]);
      setShowSiteName(false);
      return;
    }
    
    // Get ALL sites for the selected client type (not just active ones)
    // This matches what's shown in Client & Site Management
    const sites = selectedClient.sites || [];
    
    console.log('🔍 Selected client type:', selectedClient.name, '(ID:', selectedClient.id + ')');
    console.log('🔍 Sites found:', sites.length);
    
    if (sites.length > 0) {
      console.log('✅ Site names:', sites.map(s => s.name));
    } else {
      console.warn('⚠️ No sites found for client type:', selectedClient.name);
      console.warn('⚠️ Available client types:', clientTypes.map(ct => `${ct.name} (ID: ${ct.id}, sites: ${ct.sites?.length || 0})`));
      console.warn('⚠️ Check if sites exist in the database and if client_type_id matches the client type id.');
    }
    
    setFormData(prev => ({
      ...prev,
      customerType: selectedClient.name,
      customerTypeId: selectedClientTypeId,
      siteName: '',
      equipment: ''
    }));
    setSiteOptions(sites);
    setShowSiteName(selectedClientTypeId !== '');
    setShowEquipment(false);
  };

  const handleSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSiteName = e.target.value;
    setFormData(prev => ({
      ...prev,
      siteName: selectedSiteName,
      equipment: ''
    }));
    setShowEquipment(selectedSiteName !== '');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreview = () => {
    // Validate required fields (end time is now optional)
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
      setLoading(true);
      setError('');

      // Prepare data for API matching the new schema
      const ticketData = {
        customer_name: formData.customerName,
        customer_type: formData.customerType,
        asset_name: 'Asset 1', // Default asset name  
        site_name: formData.siteName,
        equipment: formData.equipment,
        category: formData.category,
        priority: formData.priority, // Include priority from form
        site_outage: formData.siteOutage,
        ticket_status: formData.ticketStatus,
        issue_start_time: formData.issueStartTime || new Date().toISOString(),
        issue_end_time: formData.issueEndTime || new Date().toISOString(), // Use entered time or current time
        kw_down: formData.kwDown ? parseFloat(formData.kwDown) : null,
        case_number: formData.caseNumber,
        issue_description: formData.issueDescription,
        additional_notes: formData.additionalNotes
      };

      console.log('Creating ticket with data:', ticketData);
      const response = await api.post('/tickets', ticketData);
      
      console.log('Ticket created successfully:', response.data);
      
      // Show success message
      alert(`Ticket created successfully! Ticket Number: ${response.data.ticket_number}`);
      
      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (err: any) {
      console.error('Error creating ticket:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const PreviewModal = () => (
    <div className="preview-overlay" onClick={() => setShowPreview(false)}>
      <div className="preview-modal" onClick={e => e.stopPropagation()}>
        <div className="preview-header">
          <h3>Ticket Preview</h3>
          <button className="close-btn" onClick={() => setShowPreview(false)}>×</button>
        </div>
        <div className="preview-content">
          <div className="preview-row">
            <span className="preview-label">Creator Name:</span>
            <span className="preview-value">{formData.customerName}</span>
          </div>
          <div className="preview-row">
            <span className="preview-label">Client Type:</span>
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
            <span className="preview-label">Priority:</span>
            <span className="preview-value">{formData.priority}</span>
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
            <span className="preview-value">{formData.issueDuration || 'Not calculated'}</span>
          </div>
          <div className="preview-row">
            <span className="preview-label">KW Down:</span>
            <span className="preview-value">{formData.kwDown || 'Not specified'}</span>
          </div>
          <div className="preview-row">
            <span className="preview-label">Case Number:</span>
            <span className="preview-value">{formData.caseNumber || 'Not specified'}</span>
          </div>
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
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Creating...' : 'Save Ticket'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <TopHeader />
      <div className="page">
      <div className="form-container">
        <div className="form-card">
          <div className="form-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <BackButton label="Back" />
              <h1 className="form-title" style={{ margin: 0 }}>Create New Ticket</h1>
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
                <label className="form-label">CREATOR NAME <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  placeholder="Customer name"
                  disabled
                />
              </div>
            </div>

            {/* Row 2: Customer Type */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">CLIENT TYPE <span className="required">*</span></label>
                {loadingClients ? (
                  <div style={{ padding: '12px', textAlign: 'center', color: '#64748b' }}>
                    Loading client types...
                  </div>
                ) : (
                  <select
                    className="form-select"
                    value={formData.customerTypeId || ''}
                    onChange={handleCustomerTypeChange}
                    required
                    style={{ cursor: 'pointer', width: '100%', padding: '12px', fontSize: '14px' }}
                  >
                    <option value="">SELECT CLIENT TYPE</option>
                    {clientTypes.map(clientType => (
                      <option key={clientType.id} value={clientType.id}>
                        {clientType.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                )}
                {!loadingClients && clientTypes.length === 0 && (
                  <div style={{ padding: '12px', color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>
                    ⚠️ No client types available. Please add client types in <strong>Client & Site Management</strong> (Admin only).
                    <br />
                    <small style={{ color: '#64748b' }}>If you just added client types, they should appear here within 3 seconds.</small>
                  </div>
                )}
              </div>
            </div>

            {/* Row 3: Site Selection */}
            {showSiteName && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">SITE <span className="required">*</span></label>
                  {siteOptions.length > 0 ? (
                    <select
                      className="form-select"
                      value={formData.siteName}
                      onChange={handleSiteChange}
                      required
                    >
                      <option value="">Select Site</option>
                      {siteOptions.map(site => {
                        const siteDisplayName = site.location 
                          ? `${site.name} (${site.location})` 
                          : site.name;
                        return (
                          <option key={site.id} value={site.name}>
                            {siteDisplayName.toUpperCase()}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <div style={{ padding: '12px', color: '#ef4444', fontSize: '14px' }}>
                      ⚠️ No sites available for this client type.
                      <br />
                      <strong>To add sites:</strong>
                      <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>
                        <li>Go to <strong>Client & Site Management</strong> (Admin only)</li>
                        <li>Click the <strong>"Sites"</strong> button next to the client type</li>
                        <li>Fill in the site form and click <strong>"Add Site"</strong></li>
                        <li>Sites will appear here within 15 seconds</li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Row 4: Equipment, Category, Site Outage, Ticket Status */}
            {showEquipment && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">EQUIPMENT <span className="required">*</span></label>
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
                  <label className="form-label">CATEGORY <span className="required">*</span></label>
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
                  <label className="form-label">PRIORITY <span className="required">*</span></label>
                  <select
                    className="form-select"
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                  >
                    {priorityOptions.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">SITE OUTAGE <span className="required">*</span></label>
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
                  <label className="form-label">TICKET STATUS</label>
                  <select
                    className="form-select"
                    value={formData.ticketStatus}
                    onChange={(e) => handleInputChange('ticketStatus', e.target.value)}
                  >
                    {ticketStatusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Row 5: Time and Duration */}
            {formData.equipment && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">ISSUE START TIME <span className="required">*</span></label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={formData.issueStartTime}
                    onChange={(e) => handleInputChange('issueStartTime', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">ISSUE END TIME</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={formData.issueEndTime}
                    onChange={(e) => handleInputChange('issueEndTime', e.target.value)}
                  />
                  <small style={{ color: '#666', fontSize: '12px' }}>Enter manually when issue was resolved</small>
                </div>

                <div className="form-group">
                  <label className="form-label">ISSUE DURATION</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.issueDuration}
                    placeholder="Auto-calculated"
                    disabled
                    style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
                  />
                  <small style={{ color: '#666', fontSize: '12px' }}>From start time to current time</small>
                </div>
              </div>
            )}

            {/* Row 6: KW Down and Case Number */}
            {formData.equipment && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">KW DOWN</label>
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
                  <label className="form-label">CASE NUMBER</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.caseNumber}
                    onChange={(e) => handleInputChange('caseNumber', e.target.value)}
                    placeholder="Enter case number"
                  />
                </div>
              </div>
            )}

            {/* Row 7: Issue Description */}
            {formData.equipment && (
              <div className="form-row">
                <div className="form-group full-width">
                  <label className="form-label">ISSUE DESCRIPTION <span className="required">*</span></label>
                  <textarea
                    className="form-textarea"
                    value={formData.issueDescription}
                    onChange={(e) => handleInputChange('issueDescription', e.target.value)}
                    placeholder="Explain the issue in detail"
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Row 8: Additional Notes */}
            {formData.equipment && (
              <div className="form-row">
                <div className="form-group full-width">
                  <label className="form-label">ADDITIONAL NOTES</label>
                  <textarea
                    className="form-textarea"
                    value={formData.additionalNotes}
                    onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                    placeholder="Add any additional points or information"
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          {formData.equipment && (
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handlePreview}
              >
                Preview Ticket
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && <PreviewModal />}
    </div>
    </>
  );
};

export default CreateTicket;