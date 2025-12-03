import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assests/logo.jpg';
import '../styles/enhanced-sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Navigation handler for filtered dashboard views
  const handleFilteredView = (filterType: string, filterValue: string) => {
    if (filterType === 'my-tickets') {
      // Navigate to dashboard with my-tickets filter
      navigate('/dashboard?filter=my-tickets');
    } else if (filterType === 'all') {
      // Navigate to dashboard with all tickets
      navigate('/dashboard');
    } else {
      // For status/priority filters, navigate with query params
      navigate(`/dashboard?${filterType}=${filterValue}`);
    }
    onClose();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      
      {/* Sidebar Toggle Button - Desktop Only */}
      <button 
        className={`sidebar-toggle ${isCollapsed ? 'collapsed' : ''}`}
        onClick={toggleSidebar}
        title={isCollapsed ? 'Show Sidebar' : 'Hide Sidebar'}
        aria-label={isCollapsed ? 'Show Sidebar' : 'Hide Sidebar'}
      >
        <span className="toggle-icon"></span>
      </button>
      
      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''} ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        
        <nav className="sidebar-nav">
          {/* Dashboard */}
          <Link 
            to="/dashboard" 
            className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`} 
            onClick={onClose}
          >
            <span className="nav-text">Dashboard</span>
          </Link>
          
          {/* Create New Ticket */}
          <Link 
            to="/create-ticket" 
            className={`nav-item ${isActive('/create-ticket') ? 'active' : ''}`} 
            onClick={onClose}
          >
            <span className="nav-text">Create New Ticket</span>
          </Link>

          {/* My Tickets */}
          <div 
            className="nav-item clickable"
            onClick={() => handleFilteredView('my-tickets', '')}
          >
            <span className="nav-text">My Tickets</span>
          </div>

          {/* Team Performance - NEW */}
          <Link 
            to="/team-performance" 
            className={`nav-item ${isActive('/team-performance') ? 'active' : ''}`} 
            onClick={onClose}
          >
            <span className="nav-text">Team Performance</span>
          </Link>

          {/* Source - NEW */}
          <Link 
            to="/source" 
            className={`nav-item ${isActive('/source') ? 'active' : ''}`} 
            onClick={onClose}
          >
            <span className="nav-text">Source</span>
          </Link>

          {/* Admin Panel - Only visible to admins */}
          {user && (user as any).role === 'admin' && (
            <>
              <Link 
                to="/admin-panel" 
                className={`nav-item admin-nav-item ${isActive('/admin-panel') ? 'active' : ''}`} 
                onClick={onClose}
              >
                <span className="nav-text">Admin Panel</span>
              </Link>
              <Link 
                to="/client-site-management" 
                className={`nav-item admin-nav-item ${isActive('/client-site-management') ? 'active' : ''}`} 
                onClick={onClose}
              >
                <span className="nav-text">Client & Site Management</span>
              </Link>
            </>
          )}
        </nav>

        {/* Footer with Logout */}
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
