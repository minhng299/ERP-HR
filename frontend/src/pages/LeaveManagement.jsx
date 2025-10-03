import { useState, useEffect } from 'react';
import { Plus, CheckCircle, XCircle, Eye } from 'lucide-react';
import { hrapi, getToken } from '../services/api.jwt';
import { useAuth } from '../contexts/AuthContext';
import CreateLeaveRequest from '../components/CreateLeaveRequest';

const LeaveManagement = () => {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [stats, setStats] = useState({ pending: 0, approved_this_month: 0, rejected_this_month: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();

      try {
        // Lấy danh sách đơn nghỉ
        const res = await hrapi.getLeaveRequests(token);
        const allRequests = res.data;

        const filtered = user?.role === 'employee'
          ? allRequests.filter(req => req.employee_id === user.id)
          : allRequests;

        setLeaveRequests(filtered);

        // Nếu là manager thì gọi thêm API thống kê
        if (user?.role === 'manager') {
          const statsRes = await hrapi.getLeaveStats(token);
          setStats(statsRes.data); // 👈 set vào state để hiển thị
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (user?.role === 'manager') {
      let approved = leaveRequests.filter(req => req.status === 'approved');
      let rejected = leaveRequests.filter(req => req.status === 'rejected');
      let pending = leaveRequests.filter(req => req.status === 'pending');

      if (filterMonth) {
        const [year, month] = filterMonth.split('-').map(Number);

        approved = approved.filter(req => {
          const date = new Date(req.start_date);
          return date.getMonth() + 1 === month && date.getFullYear() === year;
        });

        rejected = rejected.filter(req => {
          const date = new Date(req.start_date);
          return date.getMonth() + 1 === month && date.getFullYear() === year;
        });
      }

      setStats({
        pending: pending.length,
        approved_this_month: approved.length,
        rejected_this_month: rejected.length
      });
    }
  }, [leaveRequests, filterMonth, user]);


  const filteredRequests = leaveRequests.filter((request) => {
    const matchStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchName = searchTerm === '' || request.employee_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMonth = filterMonth === '' || (new Date(request.start_date).getMonth() + 1 === parseInt(filterMonth.split('-')[1]) &&
    new Date(request.start_date).getFullYear() === parseInt(filterMonth.split('-')[0]));
    return matchStatus && matchName && matchMonth;
  });


  const handleApprove = async (id) => {
    const token = getToken();
    await hrapi.approveLeaveRequest(id, token);
    setLeaveRequests(prev =>
      prev.map(req => req.id === id ? { ...req, status: 'approved' } : req)
    );
  };

  const handleReject = async (id) => {
    const token = getToken();
    await hrapi.rejectLeaveRequest(id, token);
    setLeaveRequests(prev =>
      prev.map(req => req.id === id ? { ...req, status: 'rejected' } : req)
    );
  };

  const handleCancel = async (id) => {
    const token = getToken();
    await hrapi.cancelLeaveRequest(id, token);
    setLeaveRequests(prev =>
      prev.map(req => req.id === id ? { ...req, status: 'cancelled' } : req)
    );
  };

  const handleView = (request) => {
    setSelectedRequest(request);
    setShowDetail(true);         
  };


  if (loading) return <div className="p-6">Loading data...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Leave Management</h1>

        {user?.role === 'employee' && (
          <button onClick={() => setShowForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Request</span>
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />

          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {user?.role === 'manager' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-500">Pending Requests</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">{stats.approved_this_month}</div>
            <div className="text-sm text-gray-500">
              {filterMonth ? `Approved in ${filterMonth}` : 'Total Approved'}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-red-600">{stats.rejected_this_month}</div>
            <div className="text-sm text-gray-500">
              {filterMonth ? `Rejected in ${filterMonth}` : 'Total Rejected'}
            </div>  
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{request.employee_name}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{request.leave_type_name}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{request.days_requested}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                   <div className="flex space-x-2 items-center">
                    {/* Ai cũng có thể xem */}
                    <button onClick={() => handleView(request)} className="text-blue-600 hover:text-blue-900">
                      <Eye className="h-4 w-4" />
                    </button>

                    {/* Manager: duyệt/từ chối nếu pending */}
                    {user?.role === 'manager' && request.status === 'pending' && (
                      <>
                        <button onClick={() => handleApprove(request.id)} className="text-green-600 hover:text-green-900">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleReject(request.id)} className="text-red-600 hover:text-red-900">
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}

                    {/* Employee: hủy nếu pending */}
                    {user?.role === 'employee' && request.status === 'pending' && (
                      <button onClick={() => handleCancel(request.id)} className="text-red-600 hover:text-red-900">
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

            {showDetail && selectedRequest && (
      <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-white shadow-xl rounded-lg p-6 w-full max-w-xl z-50 border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Leave Details</h2>
        <p><strong>Employee:</strong> {selectedRequest.employee_name}</p>
        <p><strong>Type:</strong> {selectedRequest.leave_type_name}</p>
        <p><strong>Duration:</strong> {new Date(selectedRequest.start_date).toLocaleDateString()} - {new Date(selectedRequest.end_date).toLocaleDateString()}</p>
        <p><strong>Days:</strong> {selectedRequest.days_requested}</p>
        <p><strong>Status:</strong> {selectedRequest.status}</p>
        <p><strong>Reason:</strong> {selectedRequest.reason}</p>

        <button onClick={() => setShowDetail(false)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
      >
        ✖
      </button>

      </div>
    )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-xl">
            <CreateLeaveRequest
              onSuccess={() => {
                setShowForm(false);
                // Optionally re-fetch data here
              }}
            />
            <button onClick={() => setShowForm(false)} className="mt-4 text-sm text-gray-500 hover:text-gray-700">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
