import React, { useState } from 'react';
import { login } from '../services/api.jwt';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();
  const { loading, setLoading, refreshUser } = useAuth();
  
  const validateForm = () => {
    const errors = {};
    
    if (!username.trim()) {
      errors.username = 'Username is required';
    } else if (username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      await login(username, password);
      await refreshUser();
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid username or password');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      
      <div className="mb-4">
        <label className="block mb-1 font-medium">Username</label>
        <input 
          type="text" 
          value={username} 
          onChange={e => {
            setUsername(e.target.value);
            if (validationErrors.username) {
              setValidationErrors(prev => ({ ...prev, username: '' }));
            }
          }}
          className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            validationErrors.username ? 'border-red-500' : 'border-gray-300'
          }`}
          required 
        />
        {validationErrors.username && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.username}</p>
        )}
      </div>
      
      <div className="mb-4">
        <label className="block mb-1 font-medium">Password</label>
        <input 
          type="password" 
          value={password} 
          onChange={e => {
            setPassword(e.target.value);
            if (validationErrors.password) {
              setValidationErrors(prev => ({ ...prev, password: '' }));
            }
          }}
          className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            validationErrors.password ? 'border-red-500' : 'border-gray-300'
          }`}
          required 
        />
        {validationErrors.password && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
        )}
      </div>
      
      {error && <div className="text-red-500 mb-4 p-2 bg-red-50 rounded">{error}</div>}
      
      <button 
        type="submit" 
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default LoginForm;