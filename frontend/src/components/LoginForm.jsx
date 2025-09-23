import React, { useState } from 'react';
import { login } from '../services/api.jwt';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  // const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loading, setLoading, refreshUser } = useAuth();
  const handleSubmit = async (e) => {
    e.preventDefault();
    // setLoading(true);
    setError('');
    try {
      await login(username, password);
      await refreshUser();
      navigate('/dashboard'); // Redirect to dashboard
    } catch (err) {
      setError('Invalid credentials');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <div className="mb-4">
        <label className="block mb-1">Username</label>
        <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full border px-3 py-2 rounded" required />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border px-3 py-2 rounded" required />
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default LoginForm;
