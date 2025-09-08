import { useEffect, useState } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { hrapi, login, getToken } from '../services/api.jwt';
import { useAuth } from '../contexts/AuthContext';
const EmployeeManagement = () => {
  const { user } = useAuth();
  console.log("user",user.role)
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    employee_id: '',
    phone_number: '',
    address: '',
    date_of_birth: '',
    hire_date: '',
    department: '',
    position: '',
    salary: '',
    manager: '',
    status: 'active',
    profile_picture: '',
  });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (!token) {
        await login();
      }
      const employeeData = await hrapi.getEmployees();
      setEmployees(employeeData.data);
      const deptData = await hrapi.getDepartments();
      setDepartments(deptData.data);
      const posData = await hrapi.getPositions();
      setPositions(posData.data);
    };
    fetchData();
  }, []);

  // Set default department and position when modal opens
  useEffect(() => {
    if (showModal && departments.length > 0 && positions.length > 0) {
      setNewEmployee(prev => ({
        ...prev,
        department: prev.department || departments[0].id,
        position: prev.position || positions[0].id,
      }));
    }
  }, [showModal, departments, positions]);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setAdding(true);
    setError('');
    // Ensure department and position are set before submit
    // if (!newEmployee.department && departments.length > 0) {
    //   newEmployee.department = departments[0].id;
    // }
    // if (!newEmployee.position && positions.length > 0) {
    //   newEmployee.position = positions[0].id;
    // }
    try {
      // Prepare data for API
      const data = {
        user: {
          username: newEmployee.username,
          email: newEmployee.email,
          password: newEmployee.password,
          first_name: newEmployee.first_name,
          last_name: newEmployee.last_name,
        },
        employee_id: newEmployee.employee_id,
        phone_number: newEmployee.phone_number,
        address: newEmployee.address,
        date_of_birth: newEmployee.date_of_birth,
        hire_date: newEmployee.hire_date,
        department: newEmployee.department,
        position: newEmployee.position,
        salary: newEmployee.salary,
        manager: newEmployee.manager || null,
        status: newEmployee.status,
        profile_picture: newEmployee.profile_picture,
      };
      console.log('Adding employee with data:', data);
      const res = await hrapi.createEmployee(data);
      setEmployees(prev => [...prev, res.data]);
      setShowModal(false);
      setNewEmployee({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        employee_id: '',
        phone_number: '',
        address: '',
        date_of_birth: '',
        hire_date: '',
        department: '',
        position: '',
        salary: '',
        manager: '',
        status: 'active',
        profile_picture: '',
      });
    } catch (err) {
      setError('Failed to add employee');
    } finally {
      setAdding(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || emp.department_name === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Employee Management</h1>

        {user.role === 'manager' && (
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2" onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" />
            <span>Add Employee</span>
          </button>
        )}
      </div>

      {/* Add Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form onSubmit={handleAddEmployee} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4">Add Employee</h2>
            <div className="mb-2">
              <label className="block mb-1">Username</label>
              <input type="text" value={newEmployee.username} onChange={e => setNewEmployee({ ...newEmployee, username: e.target.value })} className="w-full border px-3 py-2 rounded" required />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Email</label>
              <input type="email" value={newEmployee.email} onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })} className="w-full border px-3 py-2 rounded" required />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Password</label>
              <input type="password" value={newEmployee.password} onChange={e => setNewEmployee({ ...newEmployee, password: e.target.value })} className="w-full border px-3 py-2 rounded" required />
            </div>
            <div className="mb-2">
              <label className="block mb-1">First Name</label>
              <input type="text" value={newEmployee.first_name} onChange={e => setNewEmployee({ ...newEmployee, first_name: e.target.value })} className="w-full border px-3 py-2 rounded" required />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Last Name</label>
              <input type="text" value={newEmployee.last_name} onChange={e => setNewEmployee({ ...newEmployee, last_name: e.target.value })} className="w-full border px-3 py-2 rounded" required />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Employee ID</label>
              <input type="text" value={newEmployee.employee_id} onChange={e => setNewEmployee({ ...newEmployee, employee_id: e.target.value })} className="w-full border px-3 py-2 rounded" required />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Phone Number</label>
              <input type="text" value={newEmployee.phone_number} onChange={e => setNewEmployee({ ...newEmployee, phone_number: e.target.value })} className="w-full border px-3 py-2 rounded" required />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Address</label>
              <input type="text" value={newEmployee.address} onChange={e => setNewEmployee({ ...newEmployee, address: e.target.value })} className="w-full border px-3 py-2 rounded" required />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Date of Birth</label>
              <input type="date" value={newEmployee.date_of_birth} onChange={e => setNewEmployee({ ...newEmployee, date_of_birth: e.target.value })} className="w-full border px-3 py-2 rounded" required />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Hire Date</label>
              <input type="date" value={newEmployee.hire_date} onChange={e => setNewEmployee({ ...newEmployee, hire_date: e.target.value })} className="w-full border px-3 py-2 rounded" required />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Department</label>
              <select value={newEmployee.department} onChange={e => setNewEmployee({ ...newEmployee, department: e.target.value })} className="w-full border px-3 py-2 rounded" required>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-2">
              <label className="block mb-1">Position</label>
              <select value={newEmployee.position} onChange={e => setNewEmployee({ ...newEmployee, position: e.target.value })} className="w-full border px-3 py-2 rounded" required>
                {positions.map(pos => (
                  <option key={pos.id} value={pos.id}>{pos.title}</option>
                ))}
              </select>
            </div>
            <div className="mb-2">
              <label className="block mb-1">Salary</label>
              <input type="number" value={newEmployee.salary} onChange={e => setNewEmployee({ ...newEmployee, salary: e.target.value })} className="w-full border px-3 py-2 rounded" required />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Manager (optional, employee ID)</label>
              <input type="text" value={newEmployee.manager} onChange={e => setNewEmployee({ ...newEmployee, manager: e.target.value })} className="w-full border px-3 py-2 rounded" />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Status</label>
              <select value={newEmployee.status} onChange={e => setNewEmployee({ ...newEmployee, status: e.target.value })} className="w-full border px-3 py-2 rounded">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="block mb-1">Profile Picture (URL, optional)</label>
              <input type="text" value={newEmployee.profile_picture} onChange={e => setNewEmployee({ ...newEmployee, profile_picture: e.target.value })} className="w-full border px-3 py-2 rounded" />
            </div>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <div className="flex justify-end space-x-2 mt-4">
              <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={adding}>{adding ? 'Adding...' : 'Add'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search employees..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
            <select
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Employee Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hire Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEmployees.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {employee.user.first_name[0]}{employee.user.last_name[0]}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {employee.user.first_name} {employee.user.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{employee.employee_id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee.department_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee.position_title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(employee.hire_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    employee.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {employee.status}
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
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
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

export default EmployeeManagement;