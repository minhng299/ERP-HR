import React, { useState } from 'react';
import { Users, Calendar, FileText, TrendingUp, BarChart3, Home, Clock, Award } from 'lucide-react';
import Dashboard from './Dashboard';
import EmployeeManagement from './EmployeeManagement';
import AttendanceManagement from './AttendanceManagement';
import LeaveManagement from './LeaveManagement';
import PerformanceManagement from './PerformanceManagement';
import EmployeeDetail from './EmployeeDetail';
import UserProfile from './UserProfile';
import Header from '../components/Header';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Navigation tabs configuration
const tabs = [
  { id: 'dashboard', name: 'Dashboard', icon: Home, path: '/dashboard', color: 'text-blue-600' },
  { id: 'employees', name: 'Employees', icon: Users, path: '/employees', color: 'text-green-600' },
  { id: 'attendance', name: 'Attendance', icon: Clock, path: '/attendance', color: 'text-purple-600' },
  { id: 'leave', name: 'Leave Management', icon: Calendar, path: '/leave', color: 'text-orange-600' },
  { id: 'performance', name: 'Performance', icon: Award, path: '/performance', color: 'text-red-600' },
];

const ERPHRSystem = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const isActiveTab = (tabPath) => {
    if (tabPath === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(tabPath);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header onMenuToggle={toggleSidebar} isMenuOpen={isSidebarOpen} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 transition-transform duration-300 ease-in-out
          fixed lg:static inset-y-0 left-0 z-30
          w-64 bg-white border-r border-gray-200 flex flex-col
        `}>
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">ERP HR</h1>
                <p className="text-sm text-gray-500">Management System</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {tabs.map((tab) => {
              const isActive = isActiveTab(tab.path);
              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <tab.icon className={`
                    h-5 w-5 mr-3 transition-colors duration-200
                    ${isActive ? tab.color : 'text-gray-400 group-hover:text-gray-500'}
                  `} />
                  <span className="truncate">{tab.name}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.user.first_name?.charAt(0)}{user?.user.last_name?.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.user.first_name} {user?.user.last_name}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden animate-fade-in"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="min-h-full">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/employees" element={<EmployeeManagement />} />
              <Route path="/attendance" element={<AttendanceManagement />} />
              <Route path="/leave" element={<LeaveManagement />} />
              <Route path="/performance" element={<PerformanceManagement />} />
              <Route path="/employees/:id" element={<EmployeeDetail />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/" element={<Dashboard />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ERPHRSystem;