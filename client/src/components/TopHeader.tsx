import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assests/logo.jpg';
import '../styles/top-header.css';

const TopHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <header className="top-header">
      <div className="top-header-content">
        {/* Logo Section */}
        <div className="header-logo-section">
          <img 
            src={logo} 
            alt="AGS Logo" 
            className="header-logo"
          />
        </div>

        {/* Title Section */}
        <div className="header-title-section">
          <h1 className="header-main-title">AGS ROCC TEAM</h1>
          <p className="header-subtitle">Solar Asset Management System</p>
        </div>

        {/* Actions Section */}
        <div className="header-actions-section">
          {/* User Info & Logout */}
          <div className="header-logout-section">
            {user && (
              <div className="header-user-info">
                <p className="header-user-name">{user.name}</p>
                <p className="header-user-email">{user.email}</p>
              </div>
            )}
            <button 
              onClick={handleLogout}
              className="header-logout-btn"
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
