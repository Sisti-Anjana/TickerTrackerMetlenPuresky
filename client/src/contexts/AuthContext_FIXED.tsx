import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on app start
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔐 Initializing authentication...');
      
      // TEMPORARY FIX: Force clear auth and show login
      try {
        const token = localStorage.getItem('token');
        console.log('🔍 Found token:', token ? 'YES' : 'NO');
        
        if (token) {
          console.log('🔐 Verifying token...');
          
          // Set the token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Add timeout to prevent hanging
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Auth timeout')), 5000)
          );
          
          const authPromise = api.get('/auth/me');
          
          const response = await Promise.race([authPromise, timeoutPromise]);
          
          if (response && (response as any).data) {
            setUser((response as any).data.user);
            console.log('✅ Authentication restored for user:', (response as any).data.user.name);
          } else {
            throw new Error('Invalid response');
          }
        } else {
          console.log('🔐 No stored token found');
          setUser(null);
        }
      } catch (error) {
        console.log('❌ Auth failed:', error);
        console.log('🧹 Clearing authentication...');
        
        // Clear everything
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.clear();
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
      } finally {
        setLoading(false);
        console.log('🏁 Auth initialization complete');
      }
    };

    // Small delay to ensure DOM is ready
    setTimeout(initializeAuth, 100);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting login for:', email);
      setLoading(true);
      
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      // Store token and set up API headers
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      console.log('✅ Login successful for user:', userData.name);
      
    } catch (error: any) {
      console.error('❌ Login failed:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      console.log('📝 Attempting registration for:', email);
      setLoading(true);
      
      const response = await api.post('/auth/register', { name, email, password });
      const { token, user: userData } = response.data;
      
      // Store token and set up API headers
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      console.log('✅ Registration successful for user:', userData.name);
      
    } catch (error: any) {
      console.error('❌ Registration failed:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
        console.log('🔄 User data refreshed');
      }
    } catch (error) {
      console.error('❌ Failed to refresh user data:', error);
      logout();
    }
  };

  // Debug logging
  console.log('🔍 Auth State:', { user: user?.name || 'None', loading });

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
