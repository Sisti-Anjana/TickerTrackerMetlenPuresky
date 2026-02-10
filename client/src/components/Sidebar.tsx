import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, FileText, Users, BarChart3, Table, LogOut, ChevronLeft, ChevronRight, Settings, Building } from 'lucide-react';
import '../styles/enhanced-sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Initialize from localStorage or default to false (expanded)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    return savedState === 'true';
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
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
        {/* Logo Section at Top */}
        <div className="sidebar-header">
          <div className="sidebar-logo-container">
            <img src={process.env.PUBLIC_URL + '/left.png'} alt="American Green Solutions" className="sidebar-logo-img" />
            {!isCollapsed && (
              <button className="sidebar-collapse-btn" onClick={toggleSidebar} title="Collapse sidebar">
                <ChevronLeft size={16} />
              </button>
            )}
          </div>
        </div>

        <nav className="sidebar-nav">
          {/* Dashboard (unchanged terminology) */}
          <Link
            to="/dashboard"
            className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={onClose}
          >
            <LayoutDashboard size={24} className="nav-icon" />
            <span className="nav-text">Dashboard</span>
          </Link>

          {/* Create New Ticket (original label) */}
          <Link
            to="/create-ticket"
            className={`nav-item ${isActive('/create-ticket') ? 'active' : ''}`}
            onClick={onClose}
          >
            <FileText size={24} className="nav-icon" />
            <span className="nav-text">{isCollapsed ? 'Create' : 'Create New Ticket'}</span>
          </Link>

          {/* My Tickets (original label) */}
          <div
            className={`nav-item clickable ${location.pathname === '/dashboard' && location.search.includes('filter=my-tickets') ? 'active' : ''}`}
            onClick={() => handleFilteredView('my-tickets', '')}
          >
            <Users size={24} className="nav-icon" />
            <span className="nav-text">My Tickets</span>
          </div>

          {/* Team Performance - Original terminology */}
          <Link
            to="/team-performance"
            className={`nav-item ${isActive('/team-performance') ? 'active' : ''}`}
            onClick={onClose}
          >
            <BarChart3 size={24} className="nav-icon" />
            <span className="nav-text">{isCollapsed ? 'Performance' : 'Team Performance'}</span>
          </Link>

          {/* Source - Original terminology */}
          <Link
            to="/source"
            className={`nav-item ${isActive('/source') ? 'active' : ''}`}
            onClick={onClose}
          >
            <Table size={24} className="nav-icon" />
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
                <Settings size={24} className="nav-icon" />
                <span className="nav-text">{isCollapsed ? 'Admin' : 'Admin Panel'}</span>
              </Link>
              <Link
                to="/client-site-management"
                className={`nav-item admin-nav-item ${isActive('/client-site-management') ? 'active' : ''}`}
                onClick={onClose}
              >
                <Building size={24} className="nav-icon" />
                <span className="nav-text">{isCollapsed ? 'Clients' : 'Client & Site Management'}</span>
              </Link>
            </>
          )}
        </nav>

        {/* Footer with Logout */}
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} className="nav-icon" />
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
