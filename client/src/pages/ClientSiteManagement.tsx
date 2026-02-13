import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BackButton from '../components/BackButton';
import api from '../services/api';
import '../styles/ClientSiteManagement.css';

interface Site {
  id: number;
  name: string;
  location?: string;
  description?: string;
  client_type_id: number;
  status: 'active' | 'inactive';
  created_at: string;
}

interface ClientType {
  id: number;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  created_at: string;
  sites?: Site[];
}

interface Equipment {
  id: number;
  name: string;
  is_active: boolean;
}

const ClientSiteManagement: React.FC = () => {
  const { user } = useAuth();
  const [clientTypes, setClientTypes] = useState<ClientType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Client Type Form
  const [showClientForm, setShowClientForm] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientType | null>(null);
  const [clientFormData, setClientFormData] = useState({
    name: '',
    description: '',
    status: 'active' as 'active' | 'inactive'
  });

  // Site Form - Inline for each client
  const [expandedClientId, setExpandedClientId] = useState<number | null>(null);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [siteFormData, setSiteFormData] = useState({
    name: '',
    location: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
    client_type_id: 0
  });

  // Bulk Site Form
  const [showBulkSiteForm, setShowBulkSiteForm] = useState(false);
  const [bulkSitesText, setBulkSitesText] = useState('');
  const [bulkClientId, setBulkClientId] = useState<number | null>(null);
  const [bulkClientName, setBulkClientName] = useState('');

  // Equipment management
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [equipmentName, setEquipmentName] = useState('');
  const [loadingEquipment, setLoadingEquipment] = useState(false);

  useEffect(() => {
    if (user && (user as any).role === 'admin') {
      fetchClientTypes();
      fetchEquipment();
    }
  }, [user]);

  const fetchClientTypes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/client-types');
      setClientTypes(response.data.client_types || []);
    } catch (err: any) {
      console.error('Error fetching client types:', err);
      setError(err.response?.data?.message || 'Failed to load client types');
    } finally {
      setLoading(false);
    }
  };


  const fetchEquipment = async () => {
    try {
      setLoadingEquipment(true);
      const response = await api.get('/equipment');
      setEquipment(response.data.equipment || []);
    } catch (err: any) {
      console.error('Error fetching equipment:', err);
      // Don't surface as main error; equipment is auxiliary
    } finally {
      setLoadingEquipment(false);
    }
  };

  const handleEquipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipmentName.trim()) return;

    try {
      setError('');
      setSuccess('');
      const response = await api.post('/equipment', { name: equipmentName.trim() });
      const newEq = response.data.equipment;
      setEquipment((prev) => [...prev, newEq]);
      setEquipmentName('');
      setSuccess('Equipment added successfully');
    } catch (err: any) {
      console.error('Error adding equipment:', err);
      setError(err.response?.data?.message || 'Failed to add equipment');
    }
  };

  const handleDeleteEquipment = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this equipment option?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await api.delete(`/equipment/${id}`);
      setEquipment((prev) => prev.filter((eq) => eq.id !== id));
      setSuccess('Equipment deleted successfully');
    } catch (err: any) {
      console.error('Error deleting equipment:', err);
      setError(err.response?.data?.message || 'Failed to delete equipment');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('WARNING: This will delete ALL client types and sites. This action cannot be undone. Are you absolutely sure?')) {
      return;
    }

    if (!window.confirm('This is your last chance. Delete ALL data?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await api.delete('/admin/client-types/all');

      setSuccess('All client types and sites have been deleted');
      setExpandedClientId(null);
      fetchClientTypes();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to clear all data');
      setLoading(false);
    }
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');

      // Validate form data
      if (!clientFormData.name || clientFormData.name.trim() === '') {
        setError('Client type name is required');
        return;
      }

      if (editingClient) {
        // Update client type
        await api.put(`/admin/client-types/${editingClient.id}`, clientFormData);
        setSuccess('Client type updated successfully');
        setShowClientForm(false);
        setEditingClient(null);
        setClientFormData({ name: '', description: '', status: 'active' });
      } else {
        // Create client type
        console.log('Creating client type with data:', clientFormData);
        const response = await api.post('/admin/client-types', clientFormData);
        console.log('Response:', response.data);
        const newClientType = response.data.client_type;
        setSuccess('Client type created successfully');

        // Expand the new client type to show site addition form
        if (newClientType && newClientType.id) {
          setExpandedClientId(newClientType.id);
          setSiteFormData({
            name: '',
            location: '',
            description: '',
            status: 'active',
            client_type_id: newClientType.id
          });
        }
        setShowClientForm(false);
        setEditingClient(null);
        setClientFormData({ name: '', description: '', status: 'active' });
      }

      fetchClientTypes();
    } catch (err: any) {
      console.error('Error saving client type:', err);
      console.error('Error response:', err.response?.data);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save client type';
      setError(errorMessage);
    }
  };

  const handleSiteSubmit = async (e: React.FormEvent, clientId?: number) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');

      // Use the provided clientId or fall back to siteFormData.client_type_id or expandedClientId
      const targetClientId = clientId || siteFormData.client_type_id || expandedClientId;

      if (!targetClientId) {
        setError('Client type ID is missing. Please expand a client type first.');
        return;
      }

      const siteData = {
        ...siteFormData,
        client_type_id: targetClientId
      };

      if (editingSite) {
        // Update site
        await api.put(`/admin/sites/${editingSite.id}`, siteData);
        setSuccess('Site updated successfully');
        setEditingSite(null);
      } else {
        // Create site
        console.log('Creating site with data:', siteData);
        const response = await api.post('/admin/sites', siteData);
        console.log('Site created successfully:', response.data);
        setSuccess('Site created successfully');
      }

      // Reset form but keep client_type_id for the current client
      setSiteFormData({
        name: '',
        location: '',
        description: '',
        status: 'active',
        client_type_id: targetClientId
      });
      setEditingSite(null);
      fetchClientTypes();
    } catch (err: any) {
      console.error('Error saving site:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to save site');
    }
  };

  const handleDeleteClient = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this client type? This will also delete all associated sites.')) {
      return;
    }

    try {
      await api.delete(`/admin/client-types/${id}`);
      setSuccess('Client type deleted successfully');
      if (expandedClientId === id) {
        setExpandedClientId(null);
      }
      fetchClientTypes();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete client type');
    }
  };

  const handleDeleteSite = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this site?')) {
      return;
    }

    try {
      await api.delete(`/admin/sites/${id}`);
      setSuccess('Site deleted successfully');
      fetchClientTypes();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete site');
    }
  };

  const openEditClient = (client: ClientType) => {
    setEditingClient(client);
    setClientFormData({
      name: client.name,
      description: client.description || '',
      status: client.status
    });
    setShowClientForm(true);
  };

  const openEditSite = (site: Site) => {
    setEditingSite(site);
    setSiteFormData({
      name: site.name,
      location: site.location || '',
      description: site.description || '',
      status: site.status,
      client_type_id: site.client_type_id
    });
    setExpandedClientId(site.client_type_id);
  };

  const toggleClientExpansion = (clientId: number) => {
    if (expandedClientId === clientId) {
      setExpandedClientId(null);
      setEditingSite(null);
      setSiteFormData({ name: '', location: '', description: '', status: 'active', client_type_id: 0 });
    } else {
      setExpandedClientId(clientId);
      setEditingSite(null);
      setSiteFormData({
        name: '',
        location: '',
        description: '',
        status: 'active',
        client_type_id: clientId
      });
    }
  };

  const openBulkAdd = (client: ClientType) => {
    setBulkClientId(client.id);
    setBulkClientName(client.name);
    setBulkSitesText('');
    setShowBulkSiteForm(true);
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bulkClientId) return;

    const sites = bulkSitesText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (sites.length === 0) {
      setError('Please enter at least one site name');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await api.post('/admin/sites/bulk', {
        sites,
        client_type_id: bulkClientId
      });

      setSuccess(`Successfully added ${response.data.sites?.length || sites.length} sites`);
      setShowBulkSiteForm(false);
      fetchClientTypes();

      // Ensure the client is expanded to verify
      setExpandedClientId(bulkClientId);

    } catch (err: any) {
      console.error('Error adding sites in bulk:', err);
      setError(err.response?.data?.message || 'Failed to add sites recursively');
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  if (!user || (user as any).role !== 'admin') {
    return (
      <div className="client-site-management">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>This page is only accessible to administrators.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="client-site-management">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading client and site data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="client-site-management">
      <div style={{ marginBottom: '10px' }}>
        <BackButton label="Back to Dashboard" to="/dashboard" />
      </div>
      <div className="management-header">
        <div className="header-content">
          <h1>Client & Site Management</h1>
          <p>Manage customer types and their site locations</p>
        </div>
        <div className="header-actions">
          {clientTypes.length > 0 && (
            <button
              className="btn-clear-all"
              onClick={handleClearAll}
              title="Delete all client types and sites"
            >
              Clear All Data
            </button>
          )}
          <button
            className="btn-add-client"
            onClick={() => {
              setEditingClient(null);
              setClientFormData({ name: '', description: '', status: 'active' });
              setShowClientForm(true);
            }}
          >
            Add Client Type
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          ✅ {success}
        </div>
      )}

      {/* Client Types List */}
      {clientTypes.length === 0 ? (
        <div className="empty-state">

          <h2>No Client Types</h2>
          <p>Get started by adding your first client type</p>
          <button
            className="btn-add-client"
            onClick={() => {
              setEditingClient(null);
              setClientFormData({ name: '', description: '', status: 'active' });
              setShowClientForm(true);
            }}
          >
            Add Your First Client Type
          </button>
        </div>
      ) : (
        <div className="client-types-list">
          {clientTypes.map((client) => (
            <div key={client.id} className="client-type-card">
              <div className="client-type-header">
                <div className="client-type-info">
                  <h3 className="client-type-name">{client.name}</h3>
                  <div className="client-type-meta">
                    <span className={`status-badge ${client.status}`}>
                      {client.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                    <span className="site-count">
                      {client.sites?.length || 0} {client.sites?.length === 1 ? 'Site' : 'Sites'}
                    </span>
                    <span className="created-date">Created: {formatDate(client.created_at)}</span>
                  </div>
                </div>
                <div className="client-type-actions">
                  <button
                    className="btn-edit"
                    onClick={() => openEditClient(client)}
                    title="Edit Client Type"
                  >
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteClient(client.id)}
                    title="Delete Client Type"
                  >
                    Delete
                  </button>
                  <button
                    className={`btn-expand ${expandedClientId === client.id ? 'expanded' : ''}`}
                    onClick={() => toggleClientExpansion(client.id)}
                    title={expandedClientId === client.id ? 'Hide Sites' : 'Show Sites'}
                  >
                    {expandedClientId === client.id ? '▼' : '▶'} Sites
                  </button>
                </div>
              </div>

              {/* Sites Section - Always visible when expanded */}
              {expandedClientId === client.id && (
                <div className="sites-section">
                  {/* Existing Sites */}
                  {client.sites && client.sites.length > 0 && (
                    <div className="existing-sites">
                      <h4>Existing Sites ({client.sites.length})</h4>
                      <button
                        className="btn-add-client"
                        style={{ fontSize: '0.8rem', padding: '4px 8px', marginLeft: '10px' }}
                        onClick={() => openBulkAdd(client)}
                      >
                        + Bulk Add Sites
                      </button>
                      <div className="sites-grid">
                        {client.sites.map((site) => (
                          <div key={site.id} className="site-card">
                            <div className="site-info">
                              <span className="site-name">{site.name}</span>
                              {site.description && (
                                <span className="site-description" style={{ fontSize: '0.85rem', color: '#666', display: 'block' }}>{site.description}</span>
                              )}
                              {site.location && (
                                <span className="site-location">{site.location}</span>
                              )}
                              <span className={`site-status ${site.status}`}>
                                {site.status}
                              </span>
                            </div>
                            <div className="site-actions">
                              <button
                                className="btn-edit-small"
                                onClick={() => openEditSite(site)}
                                title="Edit Site"
                              >
                                Edit
                              </button>
                              <button
                                className="btn-delete-small"
                                onClick={() => handleDeleteSite(site.id)}
                                title="Delete Site"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state for sites if none exist but we want to show bulk add option */}
                  {(!client.sites || client.sites.length === 0) && (
                    <div className="no-sites-actions" style={{ marginBottom: '15px' }}>
                      <button
                        className="btn-add-client"
                        style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                        onClick={() => openBulkAdd(client)}
                      >
                        + Bulk Add Sites
                      </button>
                    </div>
                  )}

                  {/* Add/Edit Site Form */}
                  <div className="add-site-form">
                    <h4>{editingSite ? 'Edit Site' : 'Add New Site'}</h4>
                    <form onSubmit={(e) => handleSiteSubmit(e, client.id)}>
                      <div className="form-row-inline">
                        <div className="form-group">
                          <label>Site Name <span className="required">*</span></label>
                          <input
                            type="text"
                            value={siteFormData.name}
                            onChange={(e) => setSiteFormData({ ...siteFormData, name: e.target.value })}
                            placeholder="e.g., Site 1, Dover - Buckmaster pond"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Location (Optional)</label>
                          <input
                            type="text"
                            value={siteFormData.location}
                            onChange={(e) => setSiteFormData({ ...siteFormData, location: e.target.value })}
                            placeholder="e.g., MA - USA, Location 1"
                          />
                        </div>
                        <div className="form-group">
                          <label>Relevant Text (Description)</label>
                          <input
                            type="text"
                            value={siteFormData.description}
                            onChange={(e) => setSiteFormData({ ...siteFormData, description: e.target.value })}
                            placeholder="Add relevant text for dropdown"
                          />
                        </div>
                        <div className="form-group">
                          <label>Status</label>
                          <select
                            value={siteFormData.status}
                            onChange={(e) => setSiteFormData({ ...siteFormData, status: e.target.value as 'active' | 'inactive' })}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                        <div className="form-group form-actions-inline">
                          {editingSite && (
                            <button
                              type="button"
                              className="btn-cancel-small"
                              onClick={() => {
                                setEditingSite(null);
                                setSiteFormData({
                                  name: '',
                                  location: '',
                                  description: '',
                                  status: 'active',
                                  client_type_id: client.id
                                });
                              }}
                            >
                              Cancel
                            </button>
                          )}
                          <button type="submit" className="btn-submit-small">
                            {editingSite ? 'Update Site' : 'Add Site'}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )
      }


      {/* Equipment management section */}
      <div className="equipment-management">
        <h2>Equipment Library</h2>
        <p className="equipment-subtitle">
          Manage the list of equipment options shown in the ticket creation form.
        </p>

        <form onSubmit={handleEquipmentSubmit} className="equipment-form">
          <input
            type="text"
            className="equipment-input"
            placeholder="Add new equipment (e.g., Inverter Room 2)"
            value={equipmentName}
            onChange={(e) => setEquipmentName(e.target.value)}
            disabled={loadingEquipment}
          />
          <button
            type="submit"
            className="btn-add-equipment"
            disabled={loadingEquipment || !equipmentName.trim()}
          >
            {loadingEquipment ? 'Saving...' : 'Add Equipment'}
          </button>
        </form>

        <div className="equipment-list">
          {equipment.length === 0 ? (
            <p className="empty-equipment">No equipment added yet.</p>
          ) : (
            <ul>
              {equipment.map((eq) => (
                <li key={eq.id}>
                  <span className="equipment-name">{eq.name}</span>
                  <button
                    type="button"
                    className="equipment-delete-btn"
                    onClick={() => handleDeleteEquipment(eq.id)}
                    title="Delete equipment"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Client Type Modal */}
      {
        showClientForm && (
          <div className="modal-overlay" onClick={() => setShowClientForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{editingClient ? 'Edit Client Type' : 'Add Client Type'}</h2>
              <form onSubmit={handleClientSubmit}>
                <div className="form-group">
                  <label>Client Type Name <span className="required">*</span></label>
                  <input
                    type="text"
                    value={clientFormData.name}
                    onChange={(e) => setClientFormData({ ...clientFormData, name: e.target.value })}
                    placeholder="e.g., Puresky, Metlen"
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Relevant Text (Description)</label>
                  <input
                    type="text"
                    value={clientFormData.description}
                    onChange={(e) => setClientFormData({ ...clientFormData, description: e.target.value })}
                    placeholder="Add relevant text for dropdown"
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={clientFormData.status}
                    onChange={(e) => setClientFormData({ ...clientFormData, status: e.target.value as 'active' | 'inactive' })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowClientForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit">
                    {editingClient ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* Bulk Site Add Modal */}
      {
        showBulkSiteForm && (
          <div className="modal-overlay" onClick={() => setShowBulkSiteForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Bulk Add Sites for {bulkClientName}</h2>
              <p style={{ marginBottom: '15px', color: '#666', fontSize: '0.9rem' }}>
                Enter site names below, one per line.
              </p>
              <form onSubmit={handleBulkSubmit}>
                <div className="form-group">
                  <label>Site Names <span className="required">*</span></label>
                  <textarea
                    value={bulkSitesText}
                    onChange={(e) => setBulkSitesText(e.target.value)}
                    placeholder="Site 1&#10;Site 2&#10;Site 3"
                    className="bulk-site-textarea"
                    style={{
                      width: '100%',
                      minHeight: '200px',
                      padding: '10px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                    required
                    autoFocus
                  />
                  <p style={{ marginTop: '5px', fontSize: '0.8rem', color: '#888' }}>
                    {bulkSitesText.split('\n').filter(s => s.trim().length > 0).length} sites to act.
                  </p>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowBulkSiteForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit">
                    Add Sites
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default ClientSiteManagement;
