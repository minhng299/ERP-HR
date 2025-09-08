import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, hrapi } from '../services/api.jwt';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (getToken()) {
        try {
          // Fetch current employee info
          const res = await hrapi.getEmployee('me');
          console.log("employye",res)
          setUser(res.data);
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
