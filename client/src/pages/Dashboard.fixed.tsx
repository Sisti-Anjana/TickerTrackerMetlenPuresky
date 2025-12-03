import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import {
  getStatusBadge,
  getStatusIcon,
  getPriorityBadge,
  getPriorityIcon,
  getCategoryBadge,
  getCategoryIcon,
  getOutageBadge,
  formatDate
} from '../utils/badgeUtils';
import '../styles/dashboard-table.css';
import '../styles/advanced-filters.css';
import '../styles/enhanced-sidebar.css';

interface Ticket {
  id: string;
  ticket_number?: string;
  user_id?: number;
  customer_name?: string;
  customer_type?: string;
  asset_name?: string;
  site_name?: string;
  equipment?: string;
  category?: string;
  site_outage?: string;
  ticket_status?: string;
  status?: string; // Fallback field for status
  issue_start_time?: string;
  issue_end_time?: string;
  total_duration?: string;
  kw_down?: number;
  case_number?: string;
  issue_description?: string;
  additional_notes?: string;
  priority?: string;
  created_at: string;
  closed_at?: string; // For closed/resolved tickets
  users?: {
    name: string;
    email: string;
    created_at?: string;
  };
  created_by_name?: string;
  created_by_email?: string;
  is_owner?: boolean;
}

interface DashboardStats {
  total: number;
  open: number;
  closed: number;
  pending: number;
  resolved: number;
  production_impacting: number;
  communication_issues: number;
  cannot_confirm: number;
  today: number;
  this_week: number;
  this_month: number;
  filter: string;
  user: string;
  last_updated: string;
}

const Dashboard: React.FC = () => {
  // Component state and hooks
  const { user, refreshUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    open: 0,
    closed: 0,
    pending: 0,
    resolved: 0,
    production_impacting: 0,
    communication_issues: 0,
    cannot_confirm: 0,
    today: 0,
    this_week: 0,
    this_month: 0,
    filter: 'all',
    user: user?.name || '',
    last_updated: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'my-tickets'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Rest of the component code...
  
  // Handle loading state
  if (loading) {
    return (
      <div className="page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
          <small>Please wait while we fetch your tickets</small>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="page">
        <div className="alert alert-error">
          <div className="alert-content">
            <strong>⚠️ Error:</strong> {error}
            <button onClick={() => window.location.reload()} className="btn btn-small btn-outline">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main component return
  return (
    <div className="page">
      <div className="dashboard-header">
        <div className="page-header">
          <h1 className="page-title">
            {filter === 'my-tickets' ? 'My Tickets' : 'All Tickets'} Dashboard
          </h1>
          <p className="page-subtitle">
            Welcome back, {user?.name}! 
            {filter === 'my-tickets' ? ' Here are your tickets.' : ' Here are all system tickets.'}
          </p>
          <div className="dashboard-meta">
            <span className="last-update">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
            {refreshing && <span className="refreshing-indicator">🔄 Refreshing...</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
