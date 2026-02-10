import React, { useState, useEffect } from 'react';
import { UserPlus, Users, Trash2, AlertCircle, CheckCircle, Copy, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import '../styles/AdminUserManagement.css';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  must_change_password?: boolean;
  created_at: string;
}

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string, password: string } | null>(null);

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
        setError('No users found in database');
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load users. Please check your connection and try again.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
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
        setSuccess('User created successfully!');
        setCreatedCredentials({
          email: formData.email,
          password: formData.password
        });

        // Reset form
        setFormData({ name: '', email: '', password: '' });

        // Refresh users list
        await fetchUsers();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred while creating user');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  return (
    <div className="admin-user-management">
      <div className="page-header">
        <div className="header-content">
          <Users size={32} />
          <div>
            <h1>User Management</h1>
            <p>Create and manage user accounts</p>
          </div>
        </div>
        <button
          className="create-user-btn"
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setCreatedCredentials(null);
            setError('');
            setSuccess('');
          }}
        >
          <UserPlus size={20} />
          {showCreateForm ? 'Cancel' : 'Create New User'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && !createdCredentials && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {createdCredentials && (
        <div className="credentials-display">
          <div className="credentials-header">
            <CheckCircle size={24} />
            <h3>User Created Successfully!</h3>
          </div>
          <p className="credentials-note">
            Please save these credentials and provide them to the user. They won't be shown again!
          </p>
          <div className="credentials-box">
            <div className="credential-item">
              <label>Email:</label>
              <div className="credential-value">
                <span>{createdCredentials.email}</span>
                <button onClick={() => copyToClipboard(createdCredentials.email)}>
                  <Copy size={16} />
                </button>
              </div>
            </div>
            <div className="credential-item">
              <label>Temporary Password:</label>
              <div className="credential-value">
                <span>{createdCredentials.password}</span>
                <button onClick={() => copyToClipboard(createdCredentials.password)}>
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </div>
          <p className="credentials-info">
            The user will be required to change this password on their first login.
          </p>
          <button
            className="close-credentials-btn"
            onClick={() => setCreatedCredentials(null)}
          >
            Got it, close this
          </button>
        </div>
      )}

      {showCreateForm && (
        <div className="create-user-form-container">
          <h2>Create New User Account</h2>
          <form onSubmit={handleCreateUser} className="create-user-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  placeholder="john.doe@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Temporary Password *
                <button
                  type="button"
                  className="generate-password-btn"
                  onClick={generatePassword}
                >
                  Generate Password
                </button>
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Enter or generate a password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <small>Minimum 6 characters. User will be required to change it on first login.</small>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating User...' : 'Create User Account'}
            </button>
          </form>
        </div>
      )}

      <div className="users-list-container">
        <h2>All Users ({users.length})</h2>
        {loading ? (
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
            <Users size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3 style={{ marginBottom: '0.5rem', color: '#495057' }}>No Users Found</h3>
            <p style={{ color: '#6c757d', marginBottom: '1rem' }}>
              There are no users in the system yet. Create your first user account above.
            </p>
            {error && (
              <div className="alert alert-error" style={{ marginTop: '1rem', maxWidth: '500px', margin: '1rem auto 0' }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.must_change_password ? 'pending' : 'active'}`}>
                        {user.must_change_password ? 'Needs Password Change' : 'Active'}
                      </span>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserManagement;