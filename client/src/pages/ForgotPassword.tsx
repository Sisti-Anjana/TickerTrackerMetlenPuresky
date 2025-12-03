import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/auth.css';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState(''); // For testing only

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setResetToken('');
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      
      setMessage(response.data.message);
      
      // FOR TESTING ONLY - Remove in production
      if (response.data.resetToken) {
        setResetToken(response.data.resetToken);
      }
      
      setEmail(''); // Clear the email field
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="logo-text">AGS Solar</span>
          </div>
          <h1 className="auth-title">Forgot Password?</h1>
          <p className="auth-subtitle">Enter your email to receive a password reset link</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {message && (
          <div className="alert alert-success">
            <strong>✅ Request Sent!</strong>
            <p style={{ marginTop: '8px' }}>{message}</p>
            
            {/* TESTING ONLY - Shows reset link */}
            {resetToken && (
              <div style={{ marginTop: '12px', padding: '12px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#856404', marginBottom: '8px' }}>
                  🧪 TESTING MODE - Use this link:
                </p>
                <Link 
                  to={`/reset-password?token=${resetToken}`}
                  style={{ 
                    fontSize: '12px', 
                    color: '#667eea', 
                    wordBreak: 'break-all',
                    textDecoration: 'underline' 
                  }}
                >
                  Reset Password →
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="Enter your registered email address"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
            style={{
              color: '#000000',
              fontWeight: '600',
              fontSize: '16px'
            }}
          >
            {loading ? (
              <>
                <span className="spinner"></span> Sending Reset Link...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login" className="auth-link">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
