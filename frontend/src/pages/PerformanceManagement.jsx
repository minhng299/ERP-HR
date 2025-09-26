import { useState, useEffect } from 'react';
import { Plus, Eye, Edit } from 'lucide-react';
import { hrapi, login, getToken } from '../services/api.jwt';
 
const PerformanceManagement = () => {
  const [performances, setPerformances] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      // Check for token and login if needed
      let token = getToken();
      if (!token) {
        // Perform login logic here, e.g., redirect to login page or show login form
        await login();
        token = getToken(); // Get the new token after login
      }
      
      // Fetch performances data
      hrapi.getPerformances()
        .then(response => setPerformances(response.data));
    };
    
    fetchData();
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

export default PerformanceManagement;