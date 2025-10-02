import React, { useEffect, useState } from 'react';
import { Clock, Users, TrendingUp, AlertCircle, Coffee, LogOut, LogIn, Calendar, Filter, Download } from 'lucide-react';
import { hrapi } from '../services/api.jwt';
import { useAuth } from '../contexts/AuthContext';

const AttendanceManagement = () => {
  const { user } = useAuth();
  const [currentStatus, setCurrentStatus] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState({});
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filters, setFilters] = useState({
    date_from: new Date().toISOString().split('T')[0],
    date_to: new Date().toISOString().split('T')[0],
    status: ''
  });

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchCurrentStatus();
    fetchAttendanceStats();
    fetchAttendanceRecords();
  }, []);

  // Auto-refresh current status every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchCurrentStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCurrentStatus = async () => {
    try {
      const response = await hrapi.getCurrentStatus();
      setCurrentStatus(response.data);
      console.log('Current status:', response.data);
    } catch (error) {
      console.error('Failed to fetch current status:', error);
    }
  };

  const fetchAttendanceStats = async () => {
    try {
      const response = await hrapi.getAttendanceStats();
      setAttendanceStats(response.data);
    } catch (error) {
      console.error('Failed to fetch attendance stats:', error);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const response = await hrapi.getAttendance(filters);
      setAttendanceRecords(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch attendance records:', error);
    }
  };

  const handleAction = async (action, actionName) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await action();
      setSuccess(`${actionName} successful! ${response.data.message}`);
      
      // Refresh data
      await fetchCurrentStatus();
      await fetchAttendanceStats();
      await fetchAttendanceRecords();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || `Failed to ${actionName.toLowerCase()}`);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = () => {
    // Send current UTC time as ISO string
    const utcNow = new Date();
    const utcIso = utcNow.toISOString();
    handleAction(() => hrapi.checkIn({ check_in_time: utcIso }), 'Check In');
  };
  const handleCheckOut = () => handleAction(hrapi.checkOut, 'Check Out');
  const handleStartBreak = () => handleAction(hrapi.startBreak, 'Start Break');
  const handleEndBreak = () => handleAction(hrapi.endBreak, 'End Break');

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    fetchAttendanceRecords();
  };

  const getStatusColor = (status) => {
    const colors = {
      'not_started': 'bg-gray-100 text-gray-800',
      'checked_in': 'bg-green-100 text-green-800',
      'on_break': 'bg-yellow-100 text-yellow-800',
      'checked_out': 'bg-blue-100 text-blue-800',
      'incomplete': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatTime = (time) => {
    if (!time) return '-';
    // Backend now returns time in GMT+7, display as-is
    const [h, m, s] = time.split(':');
    const date = new Date(1970, 0, 1, h, m, s);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Ho_Chi_Minh'
    });
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-0">Attendance Management</h1>
        <div className="text-lg font-semibold text-gray-600">
          {currentTime.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Asia/Ho_Chi_Minh'
          })}
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Current Status Card */}
      {currentStatus && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h2 className="text-xl font-semibold mb-2">Today's Status</h2>
              <div className="text-2xl font-bold">
                {/* Display current attendance status
                  Checked In at 07:58 get the time and format then join
                */}
                {currentStatus.attendance.status_display || 'Not Started'}
              </div>
              {currentStatus.attendance.late_arrival && (
                <div className="text-yellow-200 mt-1">
                  <AlertCircle className="inline h-4 w-4 mr-1" />
                  Late Arrival
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                onClick={handleCheckIn}
                disabled={!currentStatus.can_check_in || loading}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center justify-center space-x-1 transition-colors ${
                  currentStatus.can_check_in && !loading
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Check In</span>
              </button>
              
              <button
                onClick={handleCheckOut}
                disabled={!currentStatus.can_check_out || loading}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center justify-center space-x-1 transition-colors ${
                  currentStatus.can_check_out && !loading
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Check Out</span>
              </button>
              
              <button
                onClick={handleStartBreak}
                disabled={!currentStatus.can_start_break || loading}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center justify-center space-x-1 transition-colors ${
                  currentStatus.can_start_break && !loading
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Coffee className="h-4 w-4" />
                <span className="hidden sm:inline">Start Break</span>
              </button>
              
              <button
                onClick={handleEndBreak}
                disabled={!currentStatus.can_end_break || loading}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center justify-center space-x-1 transition-colors ${
                  currentStatus.can_end_break && !loading
                    ? 'bg-purple-500 hover:bg-purple-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Coffee className="h-4 w-4" />
                <span className="hidden sm:inline">End Break</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {user.role == "manager" && <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-green-600">{attendanceStats.total_present || 0}</div>
              <div className="text-sm text-gray-500">Present Today</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <LogOut className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-blue-600">{attendanceStats.checked_out || 0}</div>
              <div className="text-sm text-gray-500">Checked Out</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-yellow-600">{attendanceStats.late_arrivals || 0}</div>
              <div className="text-sm text-gray-500">Late Arrivals</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-purple-600">{attendanceStats.average_hours || 0}h</div>
              <div className="text-sm text-gray-500">Avg Hours</div>
            </div>
          </div>
        </div>
      </div>}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row items-end space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="not_started">Not Started</option>
              <option value="checked_in">Checked In</option>
              <option value="on_break">On Break</option>
              <option value="checked_out">Checked Out</option>
              <option value="incomplete">Incomplete</option>
            </select>
          </div>
          
          <button
            onClick={applyFilters}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Apply</span>
          </button>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Attendance Records</h3>
            <button className="px-4 py-2 text-blue-600 hover:text-blue-800 flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {user?.role === 'manager' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flags</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  {user?.role === 'manager' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.employee_name}
                      {record.department_name && (
                        <div className="text-xs text-gray-500">{record.department_name}</div>
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.check_in ? formatTime(record.check_in) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.check_out ? formatTime(record.check_out) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.hours_worked_display || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                      {record.status_display || record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-1">
                      {record.late_arrival && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800">
                          Late
                        </span>
                      )}
                      {record.early_departure && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-orange-100 text-orange-800">
                          Early
                        </span>
                      )}
                      {record.overtime_hours && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-800">
                          OT
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Mobile Cards */}
        <div className="md:hidden">
          {attendanceRecords.map((record) => (
            <div key={record.id} className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-start mb-2">
                {user?.role === 'manager' && (
                  <div>
                    <div className="font-medium text-gray-900">{record.employee_name}</div>
                    {record.department_name && (
                      <div className="text-sm text-gray-500">{record.department_name}</div>
                    )}
                  </div>
                )}
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                  {record.status_display || record.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Date:</span> {new Date(record.date).toLocaleDateString()}
                </div>
                <div>
                  <span className="text-gray-500">Hours:</span> {record.hours_worked_display || '-'}
                </div>
                <div>
                  <span className="text-gray-500">In:</span> {record.check_in ? formatTime(record.check_in) : '-'}
                </div>
                <div>
                  <span className="text-gray-500">Out:</span> {record.check_out ? formatTime(record.check_out) : '-'}
                </div>
              </div>
              
              {(record.late_arrival || record.early_departure || record.overtime_hours) && (
                <div className="flex space-x-1 mt-2">
                  {record.late_arrival && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800">
                      Late
                    </span>
                  )}
                  {record.early_departure && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-orange-100 text-orange-800">
                      Early
                    </span>
                  )}
                  {record.overtime_hours && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-800">
                      Overtime
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {attendanceRecords.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No attendance records found for the selected criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceManagement;