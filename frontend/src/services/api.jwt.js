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
  getLeaveRequests: (token) =>
    api.get('/leave-requests/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  createLeaveRequest: (data, token) =>
    api.post('/leave-requests/', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  approveLeaveRequest: (id, token) =>
    api.post(`/leave-requests/${id}/approve/`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  rejectLeaveRequest: (id, token) =>
    api.post(`/leave-requests/${id}/reject/`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  
    cancelLeaveRequest: (id, token) =>
    api.post(`/leave-requests/${id}/cancel/`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

    getLeaveStats: (token) =>
    api.get('/leave-requests/stats/', {
      headers: { Authorization: `Bearer ${token}` },
    }),


    // Leave Type
  getLeaveTypes: (token) =>
    api.get('/leave-types/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // Performance
  getPerformances: () => api.get('/performances/'),
  createPerformance: (data) => api.post('/performances/', data),

  // Payroll
  getMySalary: () => api.get('/payroll/my-salary/'),
  setBaseSalary: (employeeId, salary) => api.post('/payroll/set-base-salary/', { employee_id: employeeId, salary }),
  getPerformances: () => api.get('/performances/'),                     
  getPerformance: (id) => api.get(`/performances/${id}/`),              
  createPerformance: (data) => api.post('/performances/', data),        
  updatePerformance: (id, data) => api.patch(`/performances/${id}/`, data), 
  deletePerformance: (id) => api.delete(`/performances/${id}/`),        

  getMyReviews: () => api.get('/performances/my_reviews/'),            
  getPerformancesByStatus: (status) => api.get(`/performances/by_status/?status=${status}`), 
  getPerformanceAnalytics: () => api.get('/performances/analytics/'),  
  getReviewHistory: (id) => api.get(`/performances/${id}/review_history/`), 
  exportPerformancePDF: (id) => api.get(`/performances/${id}/export_pdf/`, { responseType: 'blob' }),

  updateReviewStatus: (id, status) => api.patch(`/performances/${id}/update_status/`, { status }),
  submitEmployeeFeedback: (id, feedback) => api.post(`/performances/${id}/feedback/`, { feedback }),
};

export default api;
