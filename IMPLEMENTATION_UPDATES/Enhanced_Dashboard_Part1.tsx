import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import '../styles/dashboard.css';

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
  issue_start_time?: string;
  issue_end_time?: string;
  total_duration?: string;
  kw_down?: number;
  case_number?: string;
  issue_description?: string;
  additional_notes?: string;
  priority?: string;
  created_at: string;
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
