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
  setAuth: (user: User, token: string) => void;
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
      console.log('Initializing authentication...');
      
      try {
        const token = localStorage.getItem('token');
        console.log('Found token:', token ? 'YES' : 'NO');
        
        if (token) {
          console.log('Verifying token...');
          
          // Set the token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Add timeout to prevent hanging
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Auth timeout')), 3000)
          );
          
          const authPromise = api.get('/auth/me');
          
          const response = await Promise.race([authPromise, timeoutPromise]);
          
          if (response && (response as any).data) {
            setUser((response as any).data.user);
            console.log('Authentication restored for user:', (response as any).data.user.name);
          } else {
            throw new Error('Invalid response');
          }
        } else {
          console.log('No stored token found');
          setUser(null);
        }
      } catch (error) {
        console.log('Auth failed:', error);
        console.log('Clearing authentication...');
        
        // Clear everything
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.clear();
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
      } finally {
        setLoading(false);
        console.log('Auth initialization complete');
      }
    };

    // Small delay to ensure DOM is ready
    setTimeout(initializeAuth, 100);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      setLoading(true);
      
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      // Store token and set up API headers
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user data
      setUser(userData);
      
      console.log('Login successful for user:', userData.name);
      
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Clear any existing authentication on login failure
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      
      throw new Error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // New method to set authentication directly (for custom login flows)
  const setAuth = (userData: User, token: string) => {
    console.log('Setting authentication for user:', userData.name);
    
    // Store token
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Set up API headers
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Set user state
    setUser(userData);
    
    console.log('Authentication set successfully');
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      console.log('Attempting registration for:', { name, email });
      setLoading(true);
      
      const response = await api.post('/auth/register', { name, email, password });
      console.log('Registration response:', response.data);
      
      // Don't auto-login after registration
      // Just return success - user will be redirected to login page
      console.log('Registration successful - user should login manually');
      
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      // Clear any existing authentication on registration failure
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      
      let errorMessage = 'Registration failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please check if the database is working.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await api.get('/auth/me');
      setUser(response.data.user);
      console.log('User data refreshed:', response.data.user);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      // Don't logout on refresh failure, just log the error
    }
  };

  const logout = () => {
    console.log('Logging out user:', user?.name);
    
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    
    console.log('Logout complete');
  };

  // Debug logging
  console.log('Auth State:', { user: user?.name || 'None', loading });

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      setAuth,
      register,
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
