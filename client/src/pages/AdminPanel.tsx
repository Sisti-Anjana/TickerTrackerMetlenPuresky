import React, { useState, useEffect } from 'react';
import BackButton from '../components/BackButton';
import api from '../services/api';
import '../styles/AdminPanel.css';

interface UserType {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  must_change_password?: boolean;
}

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ name: string; email: string; password: string } | null>(null);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<UserType | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Try the admin endpoint first (requires auth, returns only 'user' role)
      try {
        const response = await api.get('/admin/users');
        if (response.data && response.data.users) {
          setUsers(response.data.users || []);
          setLoading(false);
          return;
        }
      } catch (adminError: any) {
        console.log('Admin endpoint failed, trying debug endpoint:', adminError.message);
      }
      
      // Fallback to debug endpoint (returns all users including admins)
      const response = await api.get('/auth/debug/users');
      if (response.data && response.data.users) {
        setUsers(response.data.users || []);
      } else {
        setUsers([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const generateRandomPassword = () => {
    const length = 10;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData({ ...formData, password });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.post('/admin/create-user', formData);

      if (response.data) {
        setSuccess('User account created successfully!');
        setCreatedCredentials({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });

        setFormData({ name: '', email: '', password: '' });
        await fetchUsers();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setSuccess(`${type} copied to clipboard!`);
    setTimeout(() => setSuccess(''), 2000);
  };

  const closeCredentialsModal = () => {
    setCreatedCredentials(null);
    setShowCreateForm(false);
  };

  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '' // Don't pre-fill password
    });
    setShowCreateForm(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const updateData: any = {
        name: formData.name,
        email: formData.email
      };

      // Only include password if it's provided
      if (formData.password && formData.password.length > 0) {
        updateData.password = formData.password;
      }

      const response = await api.put(`/admin/users/${editingUser.id}`, updateData);

      if (!response.data) {
        throw new Error('Failed to update user');
      }

      setSuccess('User updated successfully!');
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '' });
      setShowCreateForm(false);
      fetchUsers();

    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!showDeleteConfirm) return;

    setError('');
    setLoading(true);

    try {
      const response = await api.delete(`/admin/users/${showDeleteConfirm.id}`);

      if (!response.data) {
        throw new Error('Failed to delete user');
      }

      setSuccess('User deleted successfully!');
      setShowDeleteConfirm(null);
      fetchUsers();

    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-panel">
      <div style={{ marginBottom: '20px' }}>
        <BackButton label="Back to Dashboard" to="/dashboard" />
      </div>
      <div className="admin-panel-header">
        <div className="header-content">
          <h1>👥 User Management</h1>
          <p>Create and manage user accounts</p>
        </div>
        <button
          className="create-user-btn"
          onClick={() => {
            setShowCreateForm(true);
            setEditingUser(null);
            setFormData({ name: '', email: '', password: '' });
          }}
        >
          ➕ Create New User
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          ⚠️ {error}
        </div>
      )}

      {success && !createdCredentials && (
        <div className="alert alert-success">
          ✅ {success}
        </div>
      )}

      {/* Users List */}
      <div className="users-list">
        <h2>Existing Users ({users.length})</h2>
        {loading && users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem 2rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '2px dashed #dee2e6'
          }}>
            <p style={{ fontSize: '1.2rem', color: '#495057', marginBottom: '0.5rem' }}>👤</p>
            <h3 style={{ marginBottom: '0.5rem', color: '#495057' }}>No Users Found</h3>
            <p style={{ color: '#6c757d' }}>
              There are no users in the system yet. Create your first user account above.
            </p>
          </div>
        ) : (
          <div className="users-grid">
            {users.map((user) => (
            <div key={user.id} className="user-card">
              <div className="user-icon">
                👤
              </div>
              <div className="user-info">
                <h3>{user.name}</h3>
                <p className="user-email">{user.email}</p>
                <span className={`user-role ${user.role}`}>
                  {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                </span>
                {user.must_change_password && (
                  <span className="password-status">
                    🔑 Must change password
                  </span>
                )}
                {user.role !== 'admin' && (
                  <div className="user-actions" style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                    <button
                      className="btn-delete-user"
                      onClick={() => setShowDeleteConfirm(user)}
                      style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
            ))}
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => !createdCredentials && setShowCreateForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              type="button"
              onClick={() => setShowCreateForm(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 style={{ color: '#000' }}>{editingUser ? '✏️ Edit User Account' : '➕ Create New User Account'}</h2>

            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="create-user-form">
              <div className="form-group">
                <label>
                  👤 Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter user's full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  📧 Email Address
                </label>
                <input
                  type="email"
                  placeholder="user@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  🔑 {editingUser ? 'New Password (leave empty to keep current)' : 'Temporary Password'}
                </label>
                <div className="password-input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={editingUser ? "Enter new password (optional)" : "Enter or generate password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {!editingUser && (
                  <>
                    <button
                      type="button"
                      className="generate-password-btn"
                      onClick={generateRandomPassword}
                    >
                      🔑 Generate Random Password
                    </button>
                    <small className="password-note">
                      User will be required to change this password on first login
                    </small>
                  </>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowCreateForm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-create"
                  disabled={loading}
                  style={{ color: '#ffffff' }}
                >
                  {loading ? (editingUser ? 'Updating...' : 'Creating...') : (editingUser ? 'Update User Account' : 'Create User Account')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credentials Display Modal */}
      {createdCredentials && (
        <div className="modal-overlay">
          <div className="modal-content credentials-modal">
            <button
              className="modal-close-btn"
              type="button"
              onClick={closeCredentialsModal}
              aria-label="Close"
            >
              ×
            </button>
            <div className="success-icon">
              ✅
            </div>
            <h2>User Account Created!</h2>
            <p className="credentials-info">
              Please save these credentials and provide them to the user.
              They will be required to change their password on first login.
            </p>

            <div className="credentials-box">
              <div className="credential-item">
                <label style={{ color: '#000' }}>Full Name</label>
                <div className="credential-value">
                  <span style={{ color: '#000' }}>{createdCredentials.name}</span>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(createdCredentials.name, 'Username')}
                    style={{ color: '#ffffff' }}
                  >
                    📋 Copy
                  </button>
                </div>
              </div>

              <div className="credential-item">
                <label style={{ color: '#000' }}>Email (Username)</label>
                <div className="credential-value">
                  <span style={{ color: '#000' }}>{createdCredentials.email}</span>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(createdCredentials.email, 'Email')}
                    style={{ color: '#ffffff' }}
                  >
                    📋 Copy
                  </button>
                </div>
              </div>

              <div className="credential-item">
                <label style={{ color: '#000' }}>Password</label>
                <div className="credential-value">
                  <span className="password-text" style={{ color: '#000', fontWeight: '600' }}>{createdCredentials.password}</span>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(createdCredentials.password, 'Password')}
                    style={{ color: '#ffffff' }}
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
            </div>

            <div className="credential-code-block">
              <div className="credential-code-header">
                <span>Credentials (copy & share securely)</span>
                <button
                  className="credential-copy-btn"
                  onClick={() =>
                    copyToClipboard(
                      `Username: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`,
                      'Credentials'
                    )
                  }
                >
                  📋 Copy Both
                </button>
              </div>
              <pre className="credential-code">
Username: {createdCredentials.email}
Password: {createdCredentials.password}
              </pre>
            </div>

            <div className="warning-box">
              ⚠️ Make sure to save these credentials now. You won't be able to see the password again!
            </div>

            <button
              className="btn-done"
              onClick={closeCredentialsModal}
              style={{ color: '#ffffff' }}
            >
              I've Saved the Credentials
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: '#000' }}>🗑️ Delete User</h2>
            <p style={{ color: '#000', marginBottom: '20px' }}>
              Are you sure you want to delete <strong>{showDeleteConfirm.name}</strong> ({showDeleteConfirm.email})?
              <br />
              <span style={{ color: '#d32f2f', fontWeight: '600' }}>This action cannot be undone.</span>
            </p>
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowDeleteConfirm(null)}
                disabled={loading}
                style={{ color: '#000' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-delete-confirm"
                onClick={handleDeleteUser}
                disabled={loading}
                style={{ background: '#d32f2f', color: '#ffffff' }}
              >
                {loading ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;