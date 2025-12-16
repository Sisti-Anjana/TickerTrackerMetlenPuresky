import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Users, Mail, Lock, AlertCircle, RefreshCw, User, ArrowRight } from 'lucide-react';
import loginImage from '../assests/login.png';
import '../styles/UserLogin.css';

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
      const response = await api.post('/auth/user-login', formData);
      const data = response.data;

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
      setError(err.response?.data?.message || err.message || 'An error occurred during login');
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
      const response = await api.post('/auth/change-password', {
        userId,
        oldPassword: formData.password,
        newPassword
      });

      const data = response.data;

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
        {/* Left Side - Branding */}
        <div className="login-left-panel">
          <div className="login-logo-container">
            <img src={loginImage} alt="American Green Solutions" className="login-logo" />
          </div>
          <div className="login-welcome">
            <h3>Welcome</h3>
            <p>Please sign in to continue</p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-right-panel">
          <div className="login-form-header">
            <h1>User Login</h1>
            <p>Access your portfolio dashboard</p>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="user-login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <User size={20} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  placeholder="Type your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input
                  type="password"
                  id="password"
                  placeholder="Type your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot password?
              </Link>
            </div>

            <button 
              type="submit" 
              className="sign-in-button" 
              disabled={loading}
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight size={20} />
            </button>
          </form>

          <div className="admin-link-section">
            <div className="divider-line"></div>
            <Link to="/admin-login" className="admin-link">
              Are you an admin? Click here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;