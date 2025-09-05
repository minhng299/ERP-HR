import React, { useState, useEffect } from 'react';
import { Users, Calendar, FileText, TrendingUp, Plus, Search, Filter, Edit, Trash2, CheckCircle, XCircle, Eye } from 'lucide-react';

// Mock API functions (replace with actual API calls)
const api = {
  getDashboardStats: () => Promise.resolve({
    total_employees: 145,
    recent_hires: 8,
    pending_leaves: 12,
    departments: [
      { name: 'Engineering', employee_count: 45 },
      { name: 'Marketing', employee_count: 25 },
      { name: 'Sales', employee_count: 35 },
      { name: 'HR', employee_count: 15 },
      { name: 'Finance', employee_count: 25 }
    ]
  }),
  
  getEmployees: () => Promise.resolve([
    {
      id: 1,
      employee_id: 'EMP001',
      user: { first_name: 'John', last_name: 'Doe', email: 'john.doe@company.com' },
      department_name: 'Engineering',
      position_title: 'Senior Developer',
      hire_date: '2022-01-15',
      salary: 75000,
      status: 'active'
    },
    {
      id: 2,
      employee_id: 'EMP002',
      user: { first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@company.com' },
      department_name: 'Marketing',
      position_title: 'Marketing Manager',
      hire_date: '2021-06-20',
      salary: 65000,
      status: 'active'
    },
    {
      id: 3,
      employee_id: 'EMP003',
      user: { first_name: 'Mike', last_name: 'Johnson', email: 'mike.johnson@company.com' },
      department_name: 'Sales',
      position_title: 'Sales Representative',
      hire_date: '2023-03-10',
      salary: 55000,
      status: 'active'
    }
  ]),
  
  getAttendance: () => Promise.resolve([
    {
      id: 1,
      employee_name: 'John Doe',
      date: '2025-01-05',
      check_in: '09:00',
      check_out: '17:30',
      total_hours: '8:30'
    },
    {
      id: 2,
      employee_name: 'Jane Smith',
      date: '2025-01-05',
      check_in: '08:45',
      check_out: '17:15',
      total_hours: '8:30'
    }
  ]),
  
  getLeaveRequests: () => Promise.resolve([
    {
      id: 1,
      employee_name: 'John Doe',
      leave_type_name: 'Annual Leave',
      start_date: '2025-01-15',
      end_date: '2025-01-20',
      days_requested: 5,
      status: 'pending',
      reason: 'Family vacation'
    },
    {
      id: 2,
      employee_name: 'Mike Johnson',
      leave_type_name: 'Sick Leave',
      start_date: '2025-01-08',
      end_date: '2025-01-09',
      days_requested: 2,
      status: 'approved',
      reason: 'Medical appointment'
    }
  ]),
  
  getPerformances: () => Promise.resolve([
    {
      id: 1,
      employee_name: 'John Doe',
      reviewer_name: 'Sarah Manager',
      overall_rating: 4,
      review_period_start: '2024-07-01',
      review_period_end: '2024-12-31',
      goals_achievement: 4,
      communication: 5,
      teamwork: 4
    }
  ])
};

// Dashboard Component
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    api.getDashboardStats().then(setStats);
  }, []);
  
  if (!stats) return <div className="p-6">Loading...</div>;
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">HR Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Employees</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.total_employees}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-500 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Recent Hires</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.recent_hires}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Pending Leaves</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.pending_leaves}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-500 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Departments</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.departments.length}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Department Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Department Distribution</h2>
        <div className="space-y-4">
          {stats.departments.map((dept, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{dept.name}</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{width: `${(dept.employee_count / stats.total_employees) * 100}%`}}
                  />
                </div>
                <span className="text-sm text-gray-500">{dept.employee_count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Employee Management Component
const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  
  useEffect(() => {
    api.getEmployees().then(setEmployees);
  }, []);
  
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || emp.department_name === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Employee Management</h1>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Employee</span>
        </button>
      </div>
      
      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search employees..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
            <select
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Employee Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hire Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEmployees.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {employee.user.first_name[0]}{employee.user.last_name[0]}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {employee.user.first_name} {employee.user.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{employee.employee_id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee.department_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee.position_title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(employee.hire_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    employee.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {employee.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Attendance Management Component
const AttendanceManagement = () => {
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  useEffect(() => {
    api.getAttendance().then(setAttendance);
  }, []);
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Attendance Management</h1>
        <div className="flex space-x-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Mark Attendance</span>
          </button>
        </div>
      </div>
      
      {/* Attendance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">85</div>
          <div className="text-sm text-gray-500">Present Today</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-red-600">5</div>
          <div className="text-sm text-gray-500">Absent Today</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-yellow-600">3</div>
          <div className="text-sm text-gray-500">Late Arrivals</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">8.5</div>
          <div className="text-sm text-gray-500">Avg Hours</div>
        </div>
      </div>
      
      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hours</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendance.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {record.employee_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(record.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.check_in}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.check_out || 'Not checked out'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.total_hours || 'In progress'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    record.check_out ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {record.check_out ? 'Complete' : 'In Progress'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Leave Management Component
const LeaveManagement = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  
  useEffect(() => {
    api.getLeaveRequests().then(setLeaveRequests);
  }, []);
  
  const filteredRequests = leaveRequests.filter(request => 
    filterStatus === 'all' || request.status === filterStatus
  );
  
  const handleApprove = (id) => {
    setLeaveRequests(prev => 
      prev.map(req => req.id === id ? { ...req, status: 'approved' } : req)
    );
  };
  
  const handleReject = (id) => {
    setLeaveRequests(prev => 
      prev.map(req => req.id === id ? { ...req, status: 'rejected' } : req)
    );
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Leave Management</h1>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Request</span>
        </button>
      </div>
      
      {/* Filter Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      
      {/* Leave Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-yellow-600">12</div>
          <div className="text-sm text-gray-500">Pending Requests</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">85</div>
          <div className="text-sm text-gray-500">Approved This Month</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-red-600">8</div>
          <div className="text-sm text-gray-500">Rejected This Month</div>
        </div>
      </div>
      
      {/* Leave Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {request.employee_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {request.leave_type_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {request.days_requested}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {request.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <button className="text-blue-600 hover:text-blue-900 ml-2">
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Performance Management Component
const PerformanceManagement = () => {
  const [performances, setPerformances] = useState([]);
  
  useEffect(() => {
    api.getPerformances().then(setPerformances);
  }, []);
  
  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getRatingText = (rating) => {
    const ratings = ['', 'Poor', 'Below Average', 'Average', 'Above Average', 'Excellent'];
    return ratings[rating] || 'N/A';
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Performance Management</h1>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Review</span>
        </button>
      </div>
      
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">4.2</div>
          <div className="text-sm text-gray-500">Average Rating</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">78</div>
          <div className="text-sm text-gray-500">Reviews Completed</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-yellow-600">12</div>
          <div className="text-sm text-gray-500">Pending Reviews</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-purple-600">25</div>
          <div className="text-sm text-gray-500">Top Performers</div>
        </div>
      </div>
      
      {/* Performance Reviews Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overall Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goals</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Communication</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {performances.map((performance) => (
              <tr key={performance.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {performance.employee_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {performance.reviewer_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(performance.review_period_start).toLocaleDateString()} - {new Date(performance.review_period_end).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`text-sm font-medium ${getRatingColor(performance.overall_rating)}`}>
                      {performance.overall_rating}/5
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      ({getRatingText(performance.overall_rating)})
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm ${getRatingColor(performance.goals_achievement)}`}>
                    {performance.goals_achievement}/5
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm ${getRatingColor(performance.communication)}`}>
                    {performance.communication}/5
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main App Component
const ERPHRSystem = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: TrendingUp },
    { id: 'employees', name: 'Employees', icon: Users },
    { id: 'attendance', name: 'Attendance', icon: Calendar },
    { id: 'leave', name: 'Leave Management', icon: FileText },
    { id: 'performance', name: 'Performance', icon: TrendingUp },
  ];
  
  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'employees': return <EmployeeManagement />;
      case 'attendance': return <AttendanceManagement />;
      case 'leave': return <LeaveManagement />;
      case 'performance': return <PerformanceManagement />;
      default: return <Dashboard />;
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">ERP HR System</h1>
        </div>
        <nav className="mt-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 ${
                activeTab === tab.id ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-600' : 'text-gray-700'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-3" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderActiveComponent()}
      </div>
    </div>
  );
};

export default ERPHRSystem;