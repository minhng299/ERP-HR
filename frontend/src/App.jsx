import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import ERPHRSystem from './pages/ERPHRSystem';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './index.css';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen">
    <div className="animate-pulse">Loading...</div>
  </div>;
  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
            <Route path="/signup" element={<SignUpForm />} />
            <Route path="/login" element={<LoginForm />} />

            <Route path="/*" element={
              <PrivateRoute allowedRoles={["manager", "employee"]}>
                <>
                  
                  <ERPHRSystem />
                </>
              </PrivateRoute>
            } />
          </Routes>

      </Router>
    </AuthProvider>
  );
}

export default App;