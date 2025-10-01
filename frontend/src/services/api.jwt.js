import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const removeTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Legacy function for compatibility
export const getToken = () => {
  return getAccessToken();
};

export const setToken = (token) => {
  setTokens(token, null);
};

export const removeToken = () => {
  removeTokens();
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token refresh function
const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  try {
    const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
      refresh: refreshToken
    });
    
    const { access, refresh: newRefresh } = response.data;
    setTokens(access, newRefresh || refreshToken);
    return access;
  } catch (error) {
    removeTokens();
    window.location.href = '/login';
    throw error;
  }
};

// Attach JWT token to every request and handle token refresh
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const login = async (username, password) => {
  const response = await axios.post(`${API_BASE_URL}/token/`, { username, password });
  setTokens(response.data.access, response.data.refresh);
  return response.data;
};

export const logout = () => {
  removeTokens();
  window.location.href = '/login';
};

export const hrapi = {
  
  // Dashboard
  getDashboardStats: () => api.get('/employees/dashboard_stats/'),

  // Employees
  
  getEmployees: () => api.get('/employees/'),
  getEmployee: (id) => api.get(`/employees/${id}/`),
  createEmployee: (data) => api.post('/employees/', data),
  updateEmployee: (id, data) => api.patch(`/employees/${id}/`, data),
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

  // Profile Management
  updateMyProfile: (data) => api.patch('/employees/me/', data), // For users to update their own profile
  updateEmployeeProfile: (id, data) => api.patch(`/employees/${id}/`, data), // For managers to update employee data
  changePassword: (data) => api.post('/auth/change-password/', data),
  getCurrentUser: () => api.get('/employees/me/'),
  uploadProfilePicture: (formData) => api.patch('/employees/me/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

export default api;
