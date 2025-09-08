// import axios from 'axios';

// const API_BASE_URL = 'http://localhost:8000/api';

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Add CSRF token for Django
// api.interceptors.request.use((config) => {
//   const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
//   if (csrfToken) {
//     config.headers['X-CSRFToken'] = csrfToken;
//   }
//   return config;
// });

// export const hrapi = {
//   // Dashboard
//   getDashboardStats: () => api.get('/employees/dashboard_stats/'),
  
//   // Employees
//   getEmployees: () => api.get('/employees/'),
//   getEmployee: (id) => api.get(`/employees/${id}/`),
//   createEmployee: (data) => api.post('/employees/', data),
//   updateEmployee: (id, data) => api.put(`/employees/${id}/`, data),
//   deleteEmployee: (id) => api.delete(`/employees/${id}/`),
  
//   // Departments
//   getDepartments: () => api.get('/departments/'),
//   createDepartment: (data) => api.post('/departments/', data),
  
//   // Positions
//   getPositions: () => api.get('/positions/'),
//   createPosition: (data) => api.post('/positions/', data),
  
//   // Attendance
//   getAttendance: () => api.get('/attendance/'),
//   getTodayAttendance: () => api.get('/attendance/today/'),
//   createAttendance: (data) => api.post('/attendance/', data),
//   updateAttendance: (id, data) => api.put(`/attendance/${id}/`, data),
  
//   // Leave Requests
//   getLeaveRequests: () => api.get('/leave-requests/'),
//   createLeaveRequest: (data) => api.post('/leave-requests/', data),
//   approveLeaveRequest: (id) => api.post(`/leave-requests/${id}/approve/`),
//   rejectLeaveRequest: (id) => api.post(`/leave-requests/${id}/reject/`),
  
//   // Leave Types
//   getLeaveTypes: () => api.get('/leave-types/'),
  
//   // Performance
//   getPerformances: () => api.get('/performances/'),
//   createPerformance: (data) => api.post('/performances/', data),
// };

// export default api;