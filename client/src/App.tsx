import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoginTypeSelection from './pages/LoginTypeSelection';
import AdminLogin from './pages/AdminLogin';
import UserLogin from './pages/UserLogin';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ChangePassword from './pages/ChangePassword';
import Dashboard from './pages/Dashboard';
import DebugDashboard from './pages/DebugDashboard';
import TicketDetail from './pages/TicketDetail';
import CreateTicket from './pages/CreateTicket';
import EditTicket from './pages/EditTicket';
import Reports from './pages/Reports';
import UserManagement from './pages/UserManagement';
import AdminPanel from './pages/AdminPanel';
import TeamPerformance from './pages/TeamPerformance';
import Source from './pages/Source';
import ClientSiteManagement from './pages/ClientSiteManagement';
import './styles/force-black-text.css';
import './App.css';
import './styles/quick-fix.css';
import './styles/global-theme.css';
import './styles/no-truncation.css';
import './styles/global-text-fix.css';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/" />;
};
// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }
  
  return user ? <Navigate to="/dashboard" /> : <>{children}</>;
};

// Layout Component with Sidebar
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // On mobile, open sidebar by default so it's visible; on desktop start closed overlay
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 1024;
  });

  return (
    <div className="app-layout">
      {/* Show Navbar only on mobile */}
      <div className="mobile-navbar">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
      </div>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Login Type Selection */}
            <Route path="/" element={
              <PublicRoute>
                <LoginTypeSelection />
              </PublicRoute>
            } />
            
            {/* Admin Login */}
            <Route path="/admin-login" element={
              <PublicRoute>
                <AdminLogin />
              </PublicRoute>
            } />
            
            {/* User Login */}
            <Route path="/user-login" element={
              <PublicRoute>
                <UserLogin />
              </PublicRoute>
            } />            
            {/* Legacy routes for backward compatibility */}
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            <Route path="/forgot-password" element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            } />
            <Route path="/reset-password" element={
              <ResetPassword />
            } />
            
            {/* Protected Routes */}
            <Route path="/admin-panel" element={
              <ProtectedRoute>
                <Layout>
                  <AdminPanel />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/client-site-management" element={
              <ProtectedRoute>
                <Layout>
                  <ClientSiteManagement />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/debug" element={
              <ProtectedRoute>
                <Layout>
                  <DebugDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/tickets/:id" element={
              <ProtectedRoute>
                <Layout>
                  <TicketDetail />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/tickets/:id/edit" element={
              <ProtectedRoute>
                <Layout>
                  <EditTicket />
                </Layout>
              </ProtectedRoute>
            } />            <Route path="/create-ticket" element={
              <ProtectedRoute>
                <Layout>
                  <CreateTicket />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <Layout>
                  <UserManagement />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/team-performance" element={
              <ProtectedRoute>
                <Layout>
                  <TeamPerformance />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/source" element={
              <ProtectedRoute>
                <Layout>
                  <Source />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/change-password" element={
              <ProtectedRoute>
                <Layout>
                  <ChangePassword />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;