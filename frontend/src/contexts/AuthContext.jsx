import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAccessToken, hrapi, logout } from '../services/api.jwt';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = async () => {
    if (getAccessToken()) {
      try {
        setError(null);
        const res = await hrapi.getEmployee('me');
        console.log('Authenticated user:', res.data);
        setUser(res.data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setError('Failed to authenticate user');
        setUser(null);
        
        // If authentication fails completely, logout
        if (error.response?.status === 401) {
          logout();
        }
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Expose refreshUser and setLoading for login flow
  const refreshUser = async () => {
    setLoading(true);
    await fetchUser();
  };

  const handleLogout = () => {
    setUser(null);
    setError(null);
    logout();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      setLoading, 
      refreshUser, 
      logout: handleLogout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};