import React, { useState, useRef, useEffect } from 'react';
import { Bell, User, Settings, LogOut, Search, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { removeToken } from '../services/api.jwt';
import { useNavigate } from 'react-router-dom';

const Header = ({ onMenuToggle, isMenuOpen }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Mock notifications - replace with actual data
  const notifications = [
    {
      id: 1,
      title: 'New Leave Request',
      message: 'John Doe has submitted a leave request',
      time: '2 minutes ago',
      read: false,
      type: 'info'
    },
    {
      id: 2,
      title: 'Performance Review Due',
      message: 'You have 3 pending performance reviews',
      time: '1 hour ago',
      read: false,
      type: 'warning'
    },
    {
      id: 3,
      title: 'System Update',
      message: 'System maintenance scheduled for tonight',
      time: '3 hours ago',
      read: true,
      type: 'info'
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
      {/* Left side - Menu toggle and search */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        
        <div className="hidden md:flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees, departments..."
              className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Right side - Notifications and user menu */}
      <div className="flex items-center space-x-4">
        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-3 p-2 rounded-lg border hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {getInitials(user?.user.first_name, user?.user.last_name)}
              </span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-700">
                {user?.user.first_name} {user?.user.last_name}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.user.role}</p>
            </div>
          </button>

          {/* User dropdown menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 animate-scale-in">
              <div className="p-4 border-b border-gray-200">
                <p className="font-medium text-gray-800">
                  {user?.user.first_name} {user?.user.last_name}
                </p>
                <p className="text-sm text-gray-500">{user?.user.email}</p>
                <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full capitalize">
                  {user?.role}
                </span>
              </div>
              
              <div className="py-2">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/profile');
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <User className="h-4 w-4 mr-3" />
                  View Profile
                </button>
              </div>
              
              <div className="border-t border-gray-200 py-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;