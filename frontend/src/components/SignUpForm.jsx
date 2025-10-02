import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8000/api';

const SignUpForm = () => {
  const [form, setForm] = useState({
    username: '',
    password: '',
    email: '',
    first_name: '',
    last_name: '',
    employee_id: '',
    phone_number: '',
    address: '',
    date_of_birth: '',
    hire_date: '',
    department: '',
    position: '',
    salary: '',
    manager: '',
    profile_picture: '',
  });
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch departments, positions, and employees for select fields
    axios.get(`${API_BASE_URL}/departments/`).then(res => setDepartments(res.data));
    axios.get(`${API_BASE_URL}/positions/`).then(res => setPositions(res.data));
    axios.get(`${API_BASE_URL}/employees/`).then(res => setEmployees(res.data));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    const payload = { ...form };
    if (!payload.manager) delete payload.manager;
    if (!payload.profile_picture) delete payload.profile_picture;
    try {
      await axios.post(`${API_BASE_URL}/signup/`, payload);
      setSuccess('Sign up successful! You can now log in.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>Username</label>
          <input name="username" value={form.username} onChange={handleChange} className="w-full border px-2 py-1 rounded" required />
        </div>
        <div>
          <label>Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} className="w-full border px-2 py-1 rounded" required />
        </div>
        <div>
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full border px-2 py-1 rounded" required />
        </div>
        <div>
          <label>First Name</label>
          <input name="first_name" value={form.first_name} onChange={handleChange} className="w-full border px-2 py-1 rounded" required />
        </div>
        <div>
          <label>Last Name</label>
          <input name="last_name" value={form.last_name} onChange={handleChange} className="w-full border px-2 py-1 rounded" required />
        </div>
        <div>
          <label>Employee ID</label>
          <input name="employee_id" value={form.employee_id} onChange={handleChange} className="w-full border px-2 py-1 rounded" required />
        </div>
        <div>
          <label>Phone Number</label>
          <input name="phone_number" value={form.phone_number} onChange={handleChange} className="w-full border px-2 py-1 rounded" required />
        </div>
        <div>
          <label>Address</label>
          <input name="address" value={form.address} onChange={handleChange} className="w-full border px-2 py-1 rounded" required />
        </div>
        <div>
          <label>Date of Birth</label>
          <input name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} className="w-full border px-2 py-1 rounded" required />
        </div>
        <div>
          <label>Hire Date</label>
          <input name="hire_date" type="date" value={form.hire_date} onChange={handleChange} className="w-full border px-2 py-1 rounded" required />
        </div>
        <div>
          <label>Department</label>
          <select name="department" value={form.department} onChange={handleChange} className="w-full border px-2 py-1 rounded" required>
            <option value="">Select</option>
            {departments.map(dep => <option key={dep.id} value={dep.id}>{dep.name}</option>)}
          </select>
        </div>
        <div>
          <label>Position</label>
          <select name="position" value={form.position} onChange={handleChange} className="w-full border px-2 py-1 rounded" required>
            <option value="">Select</option>
            {positions.map(pos => <option key={pos.id} value={pos.id}>{pos.title}</option>)}
          </select>
        </div>
        <div>
          <label>Salary</label>
          <input name="salary" type="number" value={form.salary} onChange={handleChange} className="w-full border px-2 py-1 rounded" required />
        </div>
        <div>
          <label>Manager (optional)</label>
          <select name="manager" value={form.manager} onChange={handleChange} className="w-full border px-2 py-1 rounded">
            <option value="">None</option>
            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.user.first_name} {emp.user.last_name}</option>)}
          </select>
        </div>
        <div>
          <label>Profile Picture (optional)</label>
          <input name="profile_picture" value={form.profile_picture} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
        </div>
      </div>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {success && <div className="text-green-600 mt-2">{success}</div>}
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded mt-4" disabled={loading}>
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  );
};

export default SignUpForm;
