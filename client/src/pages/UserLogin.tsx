import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Users, Mail, Lock, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import '../styles/UserLogin.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

const UserLogin: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userId, setUserId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/user-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'User login failed');
      }

      // Check if password change is required
      if (data.mustChangePassword) {
        setUserId(data.userId);
        setShowPasswordChange(true);
        return;
      }

      // Store token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Update auth context
      setAuth(data.user, data.token);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          oldPassword: formData.password,
          newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password change failed');
      }

      // Store token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Update auth context
      setAuth(data.user, data.token);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred while changing password');
    } finally {
      setLoading(false);
    }
  };

  if (showPasswordChange) {
    return (
      <div className="user-login-container">
        <div className="user-login-card">
          <div className="user-login-header">
            <div className="user-icon-large">
              <RefreshCw size={60} />
            </div>
            <h1>Change Password</h1>
            <p>Please set a new password to continue</p>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="user-login-form">
            <div className="form-group">
              <label htmlFor="newPassword">
                <Lock size={18} />
                <span>New Password</span>
              </label>
              <input
                type="password"
                id="newPassword"
                placeholder="Enter new password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                <Lock size={18} />
                <span>Confirm New Password</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="user-login-button" 
              disabled={loading}
              style={{ color: '#ffffff' }}
            >
              {loading ? 'Changing Password...' : 'Change Password & Continue'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="user-login-container">
      <div className="user-login-card">
        <Link to="/" className="back-button">
          <ArrowLeft size={20} />
          <span>Back</span>
        </Link>

        <div className="user-login-header">
          <div className="user-icon-large">
            <Users size={60} />
          </div>
          <h1>User Login</h1>
          <p>Access your ticketing dashboard</p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="user-login-form">
          <div className="form-group">
            <label htmlFor="email">
              <Mail size={18} />
              <span>Email</span>
            </label>
            <input
              type="email"
              id="email"
              placeholder="your.email@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <Lock size={18} />
              <span>Password</span>
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <button 
            type="submit" 
            className="user-login-button" 
            disabled={loading}
            style={{ color: '#ffffff' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="user-login-footer">
          <p>Need access? Contact your administrator</p>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;