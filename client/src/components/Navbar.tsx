import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <button className="menu-btn" onClick={onMenuClick}>
            ☰
          </button>
          <Link to="/dashboard" className="navbar-brand">
            <span className="brand-icon">⚡</span>
            <span className="brand-text">AGS Solar Tracker</span>
          </Link>
        </div>
        
        {user && (
          <div className="navbar-right">
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">Solar Analyst</span>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;



