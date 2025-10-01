import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import ERPHRSystem from './pages/ERPHRSystem';
import EmployeeDetail from './pages/EmployeeDetail';
import { removeToken } from './services/api.jwt';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './index.css';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return <Navigate to="/login" />;
  }
  return children;
};

const LogoutButton = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };
  return (
    <button onClick={handleLogout} className="absolute bottom-4 left-4 bg-red-500 text-white px-4 py-2 rounded z-50">Logout</button>
  );
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
                  <LogoutButton />
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