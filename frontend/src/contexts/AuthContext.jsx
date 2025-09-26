import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, hrapi } from '../services/api.jwt';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    if (getToken()) {
      try {
        const res = await hrapi.getEmployee('me');
        setUser(res.data);
      } catch {
        setUser(null);
      }
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

  return (
    <AuthContext.Provider value={{ user, loading, setLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
