import { useEffect, useState } from 'react';
import { 
  Plus, Search, Filter, Eye, Edit, Trash2, Users, 
  Download, Mail, Phone, Calendar, MapPin, DollarSign,
  ChevronDown, X, CheckSquare, Square, MoreVertical,
  UserCheck, UserX, FileText, Upload, Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { hrapi, login, getToken } from '../services/api.jwt';
import { useAuth } from '../contexts/AuthContext';
import AddEmployeeModal from '../components/AddEmployeeModal';
const EmployeeManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await hrapi.deleteEmployee(id);
      setEmployees(prev => prev.filter(emp => emp.id !== id));
    } catch (err) {
      console.error('Failed to delete employee:', err);
    }
  };

  // Bulk Actions
  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(emp => emp.id));
    }
  };

  const handleSelectEmployee = (id) => {
    setSelectedEmployees(prev => 
      prev.includes(id) 
        ? prev.filter(empId => empId !== id)
        : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedEmployees.length} employees?`)) return;
    try {
      await Promise.all(selectedEmployees.map(id => hrapi.deleteEmployee(id)));
      setEmployees(prev => prev.filter(emp => !selectedEmployees.includes(emp.id)));
      setSelectedEmployees([]);
      setShowBulkActions(false);
    } catch (err) {
      console.error('Failed to delete employees:', err);
    }
  };

  const handleBulkStatusChange = async (status) => {
    try {
      await Promise.all(selectedEmployees.map(id => 
        hrapi.updateEmployeeProfile(id, { status })
      ));
      setEmployees(prev => prev.map(emp => 
        selectedEmployees.includes(emp.id) ? { ...emp, status } : emp
      ));
      setSelectedEmployees([]);
      setShowBulkActions(false);
    } catch (err) {
      console.error('Failed to update employee status:', err);
    }
  };

  const exportEmployees = () => {
    const csvContent = [
      ['Name', 'Employee ID', 'Email', 'Department', 'Position', 'Status', 'Hire Date'],
      ...filteredEmployees.map(emp => [
        `${emp.user.first_name} ${emp.user.last_name}`,
        emp.employee_id,
        emp.user.email,
        emp.department_name,
        emp.position_title,
        emp.status,
        emp.hire_date
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employees_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || emp.department_name === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || emp.status === selectedStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  }).sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = `${a.user.first_name} ${a.user.last_name}`.toLowerCase();
        bValue = `${b.user.first_name} ${b.user.last_name}`.toLowerCase();
        break;
      case 'department':
        aValue = a.department_name?.toLowerCase() || '';
        bValue = b.department_name?.toLowerCase() || '';
        break;
      case 'position':
        aValue = a.position_title?.toLowerCase() || '';
        bValue = b.position_title?.toLowerCase() || '';
        break;
      case 'hire_date':
        aValue = new Date(a.hire_date);
        bValue = new Date(b.hire_date);
        break;
      case 'status':
        aValue = a.status?.toLowerCase() || '';
        bValue = b.status?.toLowerCase() || '';
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Update bulk actions visibility
  useEffect(() => {
    setShowBulkActions(selectedEmployees.length > 0);
  }, [selectedEmployees]);
  
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-responsive-xl font-bold text-gray-800">Employee Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your organization's workforce. {filteredEmployees.length} of {employees.length} employees shown.
            {selectedEmployees.length > 0 && (
              <span className="ml-2 text-blue-600 font-medium">
                {selectedEmployees.length} selected
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Bulk Actions */}
          {showBulkActions && user.role === 'manager' && (
            <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
              <span className="text-sm text-blue-700 font-medium">
                {selectedEmployees.length} selected
              </span>
              <div className="flex space-x-1">
                <button 
                  className="btn btn-sm bg-green-100 text-green-700 hover:bg-green-200"
                  onClick={() => handleBulkStatusChange('active')}
                >
                  <UserCheck className="h-3 w-3" />
                  Activate
                </button>
                <button 
                  className="btn btn-sm bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                  onClick={() => handleBulkStatusChange('inactive')}
                >
                  <UserX className="h-3 w-3" />
                  Deactivate
                </button>
                <button 
                  className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              </div>
            </div>
          )}
          
          <button className="btn btn-secondary btn-sm" onClick={exportEmployees}>
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          
          {user.role === 'manager' && (
            <>
              <button className="btn btn-secondary btn-sm">
                <Upload className="h-4 w-4" />
                Import
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => setShowModal(true)}
              >
                <Plus className="h-4 w-4" />
                Add Employee
              </button>
            </>
          )}
        </div>
      </div>

      {/* Add Employee Modal */}
      {showModal && (
        <AddEmployeeModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleAddEmployee}
          newEmployee={newEmployee}
          setNewEmployee={setNewEmployee}
          departments={departments}
          positions={positions}
          adding={adding}
          error={error}
        />
      )}

      {/* Search and Filter */}
      <div className="card animate-slide-up">
        <div className="card-body">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, ID, or email..."
                className="w-full border rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Department Filter */}
            <div className="relative min-w-48">
              <Filter className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <select
                className="input w-full pl-10 pr-10 appearance-none cursor-pointer"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
              <ChevronDown className="h-4 w-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative min-w-40">
              <UserCheck className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <select
                className="input w-full pl-10 pr-10 appearance-none cursor-pointer"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </select>
              <ChevronDown className="h-4 w-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative min-w-40">
              <Settings className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <select
                className="input w-full pl-10 pr-10 appearance-none cursor-pointer"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="department-asc">Department A-Z</option>
                <option value="department-desc">Department Z-A</option>
                <option value="hire_date-desc">Newest First</option>
                <option value="hire_date-asc">Oldest First</option>
                <option value="status-asc">Status A-Z</option>
              </select>
              <ChevronDown className="h-4 w-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Active Filters */}
            {(searchTerm || selectedDepartment !== 'all' || selectedStatus !== 'all') && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Filters:</span>
                {searchTerm && (
                  <span className="badge badge-info flex items-center space-x-1">
                    <span>Search: {searchTerm}</span>
                    <button onClick={() => setSearchTerm('')}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedDepartment !== 'all' && (
                  <span className="badge badge-info flex items-center space-x-1">
                    <span>Dept: {selectedDepartment}</span>
                    <button onClick={() => setSelectedDepartment('all')}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedStatus !== 'all' && (
                  <span className="badge badge-info flex items-center space-x-1">
                    <span>Status: {selectedStatus}</span>
                    <button onClick={() => setSelectedStatus('all')}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Employee Cards/Table */}
      <div className="space-y-4">
        {/* Desktop Table View */}
        <div className="hidden lg:block card animate-slide-up" style={{animationDelay: '200ms'}}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {user.role === 'manager' && (
                    <th className="px-6 py-4 text-left">
                      <button
                        onClick={handleSelectAll}
                        className="p-1 rounded hover:bg-gray-200 transition-colors"
                      >
                        {selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0 ? 
                          <CheckSquare className="h-4 w-4 text-blue-600" /> : 
                          <Square className="h-4 w-4 text-gray-400" />
                        }
                      </button>
                    </th>
                  )}
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Hire Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  {user.role === 'manager' && (
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Salary
                    </th>
                  )}
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee, index) => (
                  <tr 
                    key={employee.id} 
                    className={`hover:bg-gray-50 transition-colors group ${
                      selectedEmployees.includes(employee.id) ? 'bg-blue-50' : ''
                    }`}
                    style={{animationDelay: `${300 + index * 50}ms`}}
                  >
                    {user.role === 'manager' && (
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleSelectEmployee(employee.id)}
                          className="p-1 rounded hover:bg-gray-200 transition-colors"
                        >
                          {selectedEmployees.includes(employee.id) ? 
                            <CheckSquare className="h-4 w-4 text-blue-600" /> : 
                            <Square className="h-4 w-4 text-gray-400" />
                          }
                        </button>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium group-hover:scale-110 transition-transform">
                          {employee.user.first_name[0]}{employee.user.last_name[0]}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {employee.user.first_name} {employee.user.last_name}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">{employee.employee_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-3 w-3 mr-2" />
                          <span className="truncate max-w-32">{employee.user.email}</span>
                        </div>
                        {employee.phone_number && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-3 w-3 mr-2" />
                            <span>{employee.phone_number}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                        <span className="text-sm font-medium text-gray-900">
                          {employee.department_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {employee.position_title}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-3 w-3 mr-2" />
                        {new Date(employee.hire_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${
                        employee.status === 'active' ? 'badge-success' : 
                        employee.status === 'inactive' ? 'badge-warning' : 'badge-error'
                      }`}>
                        {employee.status}
                      </span>
                    </td>
                    {user.role === 'manager' && (
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="h-3 w-3 mr-1" />
                          <span className="font-medium">{employee.salary?.toLocaleString() || 'N/A'}</span>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          onClick={() => navigate(`/employees/${employee.id}`)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {user.role === 'manager' && (
                          <>
                            <button
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              onClick={() => setEditingEmployee(employee)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              onClick={() => handleDelete(employee.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {filteredEmployees.map((employee, index) => (
            <div 
              key={employee.id} 
              className={`card hover:shadow-md transition-all duration-300 animate-slide-up ${
                selectedEmployees.includes(employee.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              style={{animationDelay: `${200 + index * 100}ms`}}
            >
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {user.role === 'manager' && (
                      <button
                        onClick={() => handleSelectEmployee(employee.id)}
                        className="p-1 rounded hover:bg-gray-200 transition-colors mt-1"
                      >
                        {selectedEmployees.includes(employee.id) ? 
                          <CheckSquare className="h-4 w-4 text-blue-600" /> : 
                          <Square className="h-4 w-4 text-gray-400" />
                        }
                      </button>
                    )}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                      {employee.user.first_name[0]}{employee.user.last_name[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {employee.user.first_name} {employee.user.last_name}
                      </h3>
                      <p className="text-sm text-gray-500 font-mono">{employee.employee_id}</p>
                    </div>
                  </div>
                  <span className={`badge ${
                    employee.status === 'active' ? 'badge-success' : 
                    employee.status === 'inactive' ? 'badge-warning' : 'badge-error'
                  }`}>
                    {employee.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Department</p>
                    <p className="text-sm font-medium text-gray-900">{employee.department_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Position</p>
                    <p className="text-sm font-medium text-gray-900">{employee.position_title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                    <p className="text-sm text-gray-900 truncate">{employee.user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Hire Date</p>
                    <p className="text-sm text-gray-900">{new Date(employee.hire_date).toLocaleDateString()}</p>
                  </div>
                  {user.role === 'manager' && employee.salary && (
                    <>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Salary</p>
                        <p className="text-sm font-medium text-green-600">${employee.salary.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Manager</p>
                        <p className="text-sm text-gray-900">{employee.manager_name || 'None'}</p>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate(`/employees/${employee.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                  {user.role === 'manager' && (
                    <>
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => setEditingEmployee(employee)}
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                      <button 
                        className="btn btn-error btn-sm"
                        onClick={() => handleDelete(employee.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Empty State */}
        {filteredEmployees.length === 0 && (
          <div className="card">
            <div className="card-body text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedDepartment !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding your first employee.'
                }
              </p>
              {user.role === 'manager' && !searchTerm && selectedDepartment === 'all' && (
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowModal(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add First Employee
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeManagement;