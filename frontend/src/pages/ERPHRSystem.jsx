import { Users, Calendar, FileText, TrendingUp } from 'lucide-react';
import Dashboard from './Dashboard';
import EmployeeManagement from './EmployeeManagement';
import AttendanceManagement from './AttendanceManagement';
import LeaveManagement from './LeaveManagement';
import PerformanceManagement from './PerformanceManagement';
import EmployeeDetail from './EmployeeDetail';
import { Link, Routes, Route, useLocation } from 'react-router-dom';

// Main App Component
const tabs = [
  { id: 'dashboard', name: 'Dashboard', icon: TrendingUp, path: '/dashboard' },
  { id: 'employees', name: 'Employees', icon: Users, path: '/employees' },
  { id: 'attendance', name: 'Attendance', icon: Calendar, path: '/attendance' },
  { id: 'leave', name: 'Leave Management', icon: FileText, path: '/leave' },
  { id: 'performance', name: 'Performance', icon: TrendingUp, path: '/performance' },
];

const ERPHRSystem = () => {
  const location = useLocation();
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">ERP HR System</h1>
        </div>
        <nav className="mt-6">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              to={tab.path}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 ${
                location.pathname.startsWith(tab.path) ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-600' : 'text-gray-700'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-3" />
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employees" element={<EmployeeManagement />} />
          <Route path="/attendance" element={<AttendanceManagement />} />
          <Route path="/leave" element={<LeaveManagement />} />
          <Route path="/performance" element={<PerformanceManagement />} />
          <Route path="/employees/:id" element={<EmployeeDetail />} />
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </div>
    </div>
  );
};

export default ERPHRSystem;

// When handling API responses, use:
// .then(response => setState(response.data))
// instead of .then(setState)