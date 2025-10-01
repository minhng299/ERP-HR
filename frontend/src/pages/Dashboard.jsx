import { useEffect, useState } from 'react';
import { Users, TrendingUp, Calendar, FileText } from 'lucide-react';
import { hrapi, login, getToken } from '../services/api.jwt';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      hrapi.getDashboardStats()
      .then(res => {
        setStats(res.data); 
        setLoading(false);
      })
      .catch(() => {
        setAuthError(true);
        setLoading(false);
      });
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (authError) return <div className="p-6 text-red-500">Authentication failed. Please log in.</div>;
  if (!stats) return <div className="p-6">No data available</div>;

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
              <p className="text-2xl font-bold text-gray-900">{stats.departments ? stats.departments.length : 0}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Department Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Department Distribution</h2>
        <div className="space-y-4">
          {stats.departments && Array.isArray(stats.departments) && stats.departments.map((dept, index) => (
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

export default Dashboard;