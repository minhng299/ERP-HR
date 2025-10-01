import { useEffect, useState } from 'react';
import { 
  Users, TrendingUp, Calendar, FileText, Clock, 
  UserCheck, UserX, AlertCircle, Award, ArrowUp, ArrowDown 
} from 'lucide-react';
import { hrapi } from '../services/api.jwt';

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, isLoading }) => {
  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card hover:shadow-lg transition-all duration-300 group">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
              {trend && (
                <div className={`flex items-center text-sm ${
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trend === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  <span className="ml-1">{trendValue}</span>
                </div>
              )}
            </div>
          </div>
          <div className={`
            w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110
            ${color === 'blue' ? 'bg-blue-100 text-blue-600' : ''}
            ${color === 'green' ? 'bg-green-100 text-green-600' : ''}
            ${color === 'yellow' ? 'bg-yellow-100 text-yellow-600' : ''}
            ${color === 'purple' ? 'bg-purple-100 text-purple-600' : ''}
            ${color === 'red' ? 'bg-red-100 text-red-600' : ''}
            ${color === 'indigo' ? 'bg-indigo-100 text-indigo-600' : ''}
          `}>
            <Icon className="h-7 w-7" />
          </div>
        </div>
      </div>
    </div>
  );
};

const DepartmentChart = ({ departments, totalEmployees, isLoading }) => {
  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="card-header">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
        </div>
        <div className="card-body space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="flex items-center space-x-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded w-8"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-purple-500', 'bg-red-500', 'bg-indigo-500'
  ];

  return (
    <div className="card animate-slide-up">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Department Distribution</h2>
          <div className="text-sm text-gray-500">
            Total: {totalEmployees} employees
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="space-y-6">
          {departments && Array.isArray(departments) && departments.map((dept, index) => {
            const percentage = totalEmployees > 0 ? (dept.employee_count / totalEmployees) * 100 : 0;
            const colorClass = colors[index % colors.length];
            
            return (
              <div key={index} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${colorClass}`}></div>
                    <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                      {dept.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
                    <span className="font-semibold text-gray-700">{dept.employee_count}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ease-out ${colorClass}`}
                    style={{
                      width: `${percentage}%`,
                      animationDelay: `${index * 100}ms`
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const RecentActivity = ({ isLoading }) => {
  const activities = [
    {
      id: 1,
      type: 'hire',
      message: 'New employee John Smith joined Engineering',
      time: '2 hours ago',
      icon: UserCheck,
      color: 'text-green-600 bg-green-100'
    },
    {
      id: 2,
      type: 'leave',
      message: 'Sarah Johnson submitted sick leave request',
      time: '4 hours ago',
      icon: Calendar,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      id: 3,
      type: 'performance',
      message: 'Q4 performance reviews completed for Marketing',
      time: '6 hours ago',
      icon: Award,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      id: 4,
      type: 'attendance',
      message: '3 employees marked late today',
      time: '8 hours ago',
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-100'
    }
  ];

  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="card-header">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="card-body space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card animate-slide-up" style={{animationDelay: '200ms'}}>
      <div className="card-header">
        <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
      </div>
      <div className="card-body">
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div 
              key={activity.id} 
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              style={{animationDelay: `${300 + index * 100}ms`}}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activity.color} group-hover:scale-110 transition-transform`}>
                <activity.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                  {activity.message}
                </p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await hrapi.getDashboardStats();
        setStats(res.data); 
        setLoading(false);
      } catch (error) {
        console.error('Dashboard stats error:', error);
        setAuthError(true);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (authError) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Failed</h3>
          <p className="text-gray-600">Please log in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-responsive-xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening at your organization.</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={loading ? '---' : stats?.total_employees || 0}
          icon={Users}
          color="blue"
          isLoading={loading}
        />
        
        <StatCard
          title="Present Today"
          value={loading ? '---' : stats?.present_today || 0}
          icon={UserCheck}
          color="green"
          isLoading={loading}
        />
        
        <StatCard
          title="Pending Leaves"
          value={loading ? '---' : stats?.pending_leaves || 0}
          icon={Calendar}
          color="yellow"
          isLoading={loading}
        />
        
        <StatCard
          title="Recent Hires"
          value={loading ? '---' : stats?.recent_hires || 0}
          icon={TrendingUp}
          color="purple"
          isLoading={loading}
        />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Distribution */}
        <div className="lg:col-span-2">
          <DepartmentChart 
            departments={stats?.departments}
            totalEmployees={stats?.total_employees || 0}
            isLoading={loading}
          />
        </div>
        
        {/* Recent Activity */}
        <div>
          <RecentActivity isLoading={loading} />
        </div> 
      </div>
    </div>
  );
};

export default Dashboard;