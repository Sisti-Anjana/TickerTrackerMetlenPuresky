import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User } from 'lucide-react';
import '../styles/LoginTypeSelection.css';

const LoginTypeSelection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="login-type-container">
      <div className="login-type-content">
        <div className="login-type-header">
          <h1 className="login-type-title" style={{ color: '#000000' }}>
            Welcome to AGS Ticketing System
          </h1>
          <p className="login-type-subtitle" style={{ color: '#000000' }}>
            Please select your login type to continue
          </p>
        </div>

        <div className="login-type-cards">
          <div 
            className="login-type-card admin-card"
            onClick={() => navigate('/admin-login')}
          >
            <div className="card-icon">
              <ShieldCheck size={40} />
            </div>
            <h2>Admin Login</h2>
            <p>System administrators and managers</p>
            <button className="select-button admin-button">
              Continue as Admin
            </button>
          </div>

          <div 
            className="login-type-card user-card"
            onClick={() => navigate('/user-login')}
          >
            <div className="card-icon">
              <User size={40} />
            </div>
            <h2>User Login</h2>
            <p>Team members and staff</p>
            <button className="select-button user-button">
              Continue as User
            </button>
          </div>
        </div>

        <div className="login-type-footer">
          <p>Need help? Contact your system administrator</p>
        </div>
      </div>
    </div>
  );
};

export default LoginTypeSelection;