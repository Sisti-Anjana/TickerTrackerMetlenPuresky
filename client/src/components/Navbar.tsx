import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Moon, Info, X, Settings, LogOut, Sun } from 'lucide-react';
import brandLogo from '../assests/logo.jpg';
import '../styles/navbar.css';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [theme, setTheme] = React.useState(() => {
    return localStorage.getItem('app-theme') || 'light';
  });

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAdminClick = () => {
    navigate('/admin-panel');
    setIsDrawerOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <button
              className="navbar-menu-btn"
              onClick={onMenuClick}
              aria-label="Toggle Sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="navbar-center">
            <h1 className="navbar-main-title">AGS ROCC TEAM</h1>
            <p className="navbar-subtitle">Solar Asset Management System</p>
          </div>

          {user && (
            <div className="navbar-right">
              <div className="navbar-actions">
                <div className="theme-toggle-wrapper" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
                  <div className={`theme-toggle-switch ${theme}`}>
                    <div className="theme-toggle-handle">
                      {theme === 'light' ? <Sun size={14} className="theme-icon sun" /> : <Moon size={14} className="theme-icon moon" />}
                    </div>
                  </div>
                </div>
                <button
                  className="navbar-icon-btn"
                  onClick={() => setShowInfo(true)}
                  title="Application Info"
                >
                  <Info size={20} />
                </button>
              </div>
              <div className="user-profile-trigger" onClick={() => setIsDrawerOpen(true)}>
                <img src={process.env.PUBLIC_URL + '/sidebar.png'} alt="User Profile" className="navbar-right-logo" />
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Info Modal */}
      {showInfo && (
        <div className="modal-overlay" onClick={() => setShowInfo(false)}>
          <div className="info-modal-content" onClick={e => e.stopPropagation()}>
            <button className="drawer-close-btn" onClick={() => setShowInfo(false)}>
              <X size={24} />
            </button>
            <div className="info-modal-body">
              <div className="info-logo-container">
                <img src={process.env.PUBLIC_URL + '/left.png'} alt="AGS Logo" />
              </div>
              <h2>AGS ROCC TEAM</h2>
              <h3>Solar Asset Management System</h3>
              <p>
                A comprehensive monitoring and management platform for solar energy assets.
                Designed for the AGS ROCC Team to ensure maximum performance,
                real-time analytics, and seamless maintenance tracking.
              </p>
              <div className="info-footer">
                <span>Version 2.1.0</span>
                <span>© 2026 American Green Solutions</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Drawer Overlay */}
      {isDrawerOpen && <div className="drawer-overlay" onClick={() => setIsDrawerOpen(false)}></div>}

      {/* User Profile Drawer */}
      <div className={`user-profile-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <button className="drawer-close-btn" onClick={() => setIsDrawerOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="drawer-content">
          <div className="drawer-user-info">
            <div className="drawer-logo-container">
              <img src={process.env.PUBLIC_URL + '/left.png'} alt="AGS Logo" className="drawer-large-logo" />
            </div>
            <h2 className="drawer-user-name">{user?.name}</h2>
            <p className="drawer-user-email">{user?.email || 'user@example.com'}</p>
            <span className="drawer-user-role-badge">
              {user?.role === 'admin' ? 'SUPER ADMIN' : 'USER'}
            </span>
          </div>

          <div className="drawer-menu">
            <button className="drawer-menu-item" onClick={handleAdminClick}>
              <Settings size={20} className="menu-icon" />
              <span>Admin Panel</span>
            </button>
          </div>

          <div className="drawer-footer">
            <button className="drawer-logout-btn" onClick={handleLogout}>
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
