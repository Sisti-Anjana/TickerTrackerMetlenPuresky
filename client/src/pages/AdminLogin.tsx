import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { ShieldCheck, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import loginImage from '../assests/login.png';
import '../styles/AdminLogin.css';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/admin-login', formData);
      const data = response.data;

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

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
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
            <h1>Admin Login</h1>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="form-group">
              <label htmlFor="email">Admin Email</label>
              <input
                type="email"
                id="email"
                placeholder="Type your admin email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Type your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="sign-in-button" disabled={loading}>
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight size={20} />
            </button>
          </form>

          <div className="admin-link-section">
            <p className="security-note">
              <ShieldCheck size={16} />
              This is a secure admin area
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;