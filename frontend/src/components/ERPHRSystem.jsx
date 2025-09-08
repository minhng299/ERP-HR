import { useState, useEffect } from 'react';
import { Users, Calendar, FileText, TrendingUp } from 'lucide-react';
import Dashboard from './Dashboard';
import EmployeeManagement from './EmployeeManagement';
import AttendanceManagement from './AttendanceManagement';
import LeaveManagement from './LeaveManagement';
import PerformanceManagement from './PerformanceManagement';
import { hrapi, login, getToken } from '../services/api.jwt';

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

// When handling API responses, use:
// .then(response => setState(response.data))
// instead of .then(setState)