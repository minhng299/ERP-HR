import { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Download } from 'lucide-react';
import { hrapi, login, getToken } from '../services/api.jwt';
import NewReviewModal from "../components/performance/NewReviewModal";
import EditReviewModal from "../components/performance/EditReviewModal";
import ViewReviewModal from "../components/performance/ViewReviewModal";

const PerformanceManagement = () => {
  const [performances, setPerformances] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      let token = getToken();
      if (!token) {
        await login();
        token = getToken();
      }

      // Fetch performances and analytics
      hrapi.getPerformances().then(response => setPerformances(response.data));
      hrapi.getPerformanceAnalytics().then(response => setAnalytics(response.data));
    };

    fetchData();
  }, []);

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    if (status === 'all') {
      hrapi.getPerformances().then(response => setPerformances(response.data));
    } else {
      hrapi.getPerformancesByStatus(status).then(response => setPerformances(response.data));
    }
  };

  const handleExportPDF = (id) => {
    hrapi.exportPerformancePDF(id).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `performance_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
    });
  };

  const fetchPerformances = async () => {
    try {
      const res = await hrapi.getPerformances();
      setPerformances(res.data);
  
      const analyticsRes = await hrapi.getPerformanceAnalytics();
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error("Failed to fetch performances:", err);
    }
  };
  
  useEffect(() => {
    fetchPerformances();
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
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2" 
          onClick={() => setIsNewModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          <span>New Review</span>
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <label className="text-gray-700 font-medium mr-4">Filter by Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2"
        >
          <option value="all">All</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="finalized">Finalized</option>
        </select>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">{analytics.avg_overall_rating || 'N/A'}</div>
          <div className="text-sm text-gray-500">Average Rating</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">{analytics.total_reviews || 0}</div>
          <div className="text-sm text-gray-500">Total Reviews</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-yellow-600">{analytics.draft_reviews || 0}</div>
          <div className="text-sm text-gray-500">Pending Reviews</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-purple-600">{analytics.finalized_reviews || 0}</div>
          <div className="text-sm text-gray-500">Finalized Reviews</div>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button 
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => {
                        setSelectedReview(performance);
                        setIsViewModalOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button 
                      className="text-green-600 hover:text-green-900"
                      onClick={() => {
                        setSelectedReview(performance);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      className="text-purple-600 hover:text-purple-900"
                      onClick={() => handleExportPDF(performance.id)}
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <NewReviewModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />
      <EditReviewModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        review={selectedReview}
        onUpdated={(updatedReview) => {
          fetchPerformances();
          setSelectedReview(updatedReview);
        }}
      />
      <ViewReviewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        review={selectedReview}
      />
    </div>
  );
};

export default PerformanceManagement;