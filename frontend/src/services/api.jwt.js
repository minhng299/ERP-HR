import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';
const TOKEN_KEY = 'jwt_token';

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export const login = async (username, password) => {
  const response = await axios.post(`${API_BASE_URL}/token/`, { username, password });
  setToken(response.data.access);
  return response.data;
};

export const hrapi = {
  // Dashboard
  getDashboardStats: () => api.get('/employees/dashboard_stats/'),

  // Employees
  getEmployees: () => api.get('/employees/'),
  getEmployee: (id) => api.get(`/employees/${id}/`),
  createEmployee: (data) => api.post('/employees/', data),
  updateEmployee: (id, data) => api.put(`/employees/${id}/`, data),
  deleteEmployee: (id) => api.delete(`/employees/${id}/`),

  // Departments
  getDepartments: () => api.get('/departments/'),
  createDepartment: (data) => api.post('/departments/', data),

  // Positions
  getPositions: () => api.get('/positions/'),
  createPosition: (data) => api.post('/positions/', data),

  // Attendance
  getAttendance: () => api.get('/attendance/'),
  getTodayAttendance: () => api.get('/attendance/today/'),
  createAttendance: (data) => api.post('/attendance/', data),
  updateAttendance: (id, data) => api.put(`/attendance/${id}/`, data),

  // Leave Requests
  getLeaveRequests: () => api.get('/leave-requests/'),
  createLeaveRequest: (data) => api.post('/leave-requests/', data),
  approveLeaveRequest: (id) => api.post(`/leave-requests/${id}/approve/`),
  rejectLeaveRequest: (id) => api.post(`/leave-requests/${id}/reject/`),
  getLeaveTypes: () => api.get('/leave-types/'),

  // Performance
  getPerformances: () => api.get('/performances/'),
  createPerformance: (data) => api.post('/performances/', data),

  // Payroll
  getMySalary: () => api.get('/payroll/my-salary/'),
};

export default api;
