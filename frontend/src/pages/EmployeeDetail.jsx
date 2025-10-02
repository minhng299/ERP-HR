import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Save, X, Mail, Phone, MapPin, Calendar, 
  DollarSign, Building, Briefcase, User, Clock, Award,
  FileText, Camera, Shield, AlertCircle, CheckCircle
} from 'lucide-react';
import { hrapi } from '../services/api.jwt';
import { useAuth } from '../contexts/AuthContext';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [managers, setManagers] = useState([]);
  
  const [form, setForm] = useState({
    // User fields
    first_name: '',
    last_name: '',
    email: '',
    // Employee fields
    phone_number: '',
    address: '',
    date_of_birth: '',
    hire_date: '',
    salary: '',
    status: '',
    department: '',
    position: '',
    manager: '',
    profile_picture: ''
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [employeeRes, deptRes, posRes, empRes] = await Promise.all([
          hrapi.getEmployee(id),
          hrapi.getDepartments(),
          hrapi.getPositions(),
          hrapi.getEmployees() // To get potential managers
        ]);
        
        const emp = employeeRes.data;
        setEmployee(emp);
        setDepartments(deptRes.data);
        setPositions(posRes.data);
        setManagers(empRes.data.filter(e => e.id !== parseInt(id) && e.role === 'manager'));
        
        // Initialize form with current data
        setForm({
          first_name: emp.user.first_name,
          last_name: emp.user.last_name,
          email: emp.user.email,
          phone_number: emp.phone_number || '',
          address: emp.address || '',
          date_of_birth: emp.date_of_birth || '',
          hire_date: emp.hire_date || '',
          salary: emp.salary || '',
          status: emp.status || 'active',
          department: emp.department || '',
          position: emp.position || '',
          manager: emp.manager || '',
          profile_picture: emp.profile_picture || ''
        });
      } catch (err) {
        setError('Failed to fetch employee data');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!form.first_name?.trim()) errors.first_name = 'First name is required';
    if (!form.last_name?.trim()) errors.last_name = 'Last name is required';
    if (!form.email?.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Email is invalid';
    if (form.phone_number && !/^\+?[\d\s\-\(\)]{10,}$/.test(form.phone_number)) {
      errors.phone_number = 'Phone number is invalid';
    }
    if (!form.department) errors.department = 'Department is required';
    if (!form.position) errors.position = 'Position is required';
    if (form.salary && (isNaN(form.salary) || form.salary < 0)) {
      errors.salary = 'Salary must be a valid positive number';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData = {
        user: {
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
        },
        phone_number: form.phone_number,
        address: form.address,
        date_of_birth: form.date_of_birth,
        hire_date: form.hire_date,
        salary: form.salary ? parseFloat(form.salary) : null,
        status: form.status,
        department: form.department,
        position: form.position,
        manager: form.manager || null,
        profile_picture: form.profile_picture,
      };
      
      const res = await hrapi.updateEmployeeProfile(id, updateData);
      setEmployee(res.data);
      setEditing(false);
      setSuccess('Employee updated successfully!');
    } catch (err) {
      setError('Failed to update employee. Please check all fields and try again.');
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setValidationErrors({});
    // Reset form to original values
    if (employee) {
      setForm({
        first_name: employee.user.first_name,
        last_name: employee.user.last_name,
        email: employee.user.email,
        phone_number: employee.phone_number || '',
        address: employee.address || '',
        date_of_birth: employee.date_of_birth || '',
        hire_date: employee.hire_date || '',
        salary: employee.salary || '',
        status: employee.status || 'active',
        department: employee.department || '',
        position: employee.position || '',
        manager: employee.manager || '',
        profile_picture: employee.profile_picture || ''
      });
    }
  };

  const getInitials = () => {
    if (!employee) return '';
    return `${employee.user.first_name?.[0] || ''}${employee.user.last_name?.[0] || ''}`.toUpperCase();
  };

  const getDepartmentName = (deptId) => {
    const dept = departments.find(d => d.id === deptId);
    return dept?.name || 'Unknown';
  };

  const getPositionName = (posId) => {
    const pos = positions.find(p => p.id === posId);
    return pos?.title || 'Unknown';
  };

  const getManagerName = (managerId) => {
    const manager = managers.find(m => m.id === managerId);
    return manager ? `${manager.user.first_name} ${manager.user.last_name}` : 'None';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'employment', label: 'Employment', icon: Briefcase },
    { id: 'personal', label: 'Personal Info', icon: FileText },
  ];

  if (loading && !employee) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading employee details...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Employee Not Found</h2>
        <p className="text-gray-600 mb-4">The employee you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => navigate('/employees')}
          className="btn btn-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Employees
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/employees')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-responsive-xl font-bold text-gray-800">Employee Profile</h1>
            <p className="text-gray-600 mt-1">
              {editing ? 'Editing employee information' : 'View and manage employee details'}
            </p>
          </div>
        </div>
        
        {user.role === 'manager' && (
          <div className="flex items-center space-x-3">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="btn btn-primary"
              >
                <Edit className="h-4 w-4" />
                Edit Employee
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancel}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="btn btn-primary"
                >
                  <Save className="h-4 w-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="alert alert-success">
          <CheckCircle className="h-4 w-4" />
          <span>{success}</span>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="card animate-slide-up">
        <div className="card-body">
          <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                {getInitials()}
              </div>
              {editing && (
                <button className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md border hover:bg-gray-50 transition-colors">
                  <Camera className="h-4 w-4 text-gray-600" />
                </button>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1 text-center lg:text-left">
              {editing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text">First Name *</span>
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      className={`input ${validationErrors.first_name ? 'input-error' : ''}`}
                      disabled={loading}
                    />
                    {validationErrors.first_name && (
                      <span className="text-red-500 text-sm">{validationErrors.first_name}</span>
                    )}
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Last Name *</span>
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      className={`input ${validationErrors.last_name ? 'input-error' : ''}`}
                      disabled={loading}
                    />
                    {validationErrors.last_name && (
                      <span className="text-red-500 text-sm">{validationErrors.last_name}</span>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">
                      <span className="label-text">Email Address *</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className={`input ${validationErrors.email ? 'input-error' : ''}`}
                      disabled={loading}
                    />
                    {validationErrors.email && (
                      <span className="text-red-500 text-sm">{validationErrors.email}</span>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {employee.user.first_name} {employee.user.last_name}
                  </h2>
                  <p className="text-xl text-gray-600 mb-4">{employee.position_title}</p>
                  <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-3 lg:space-y-0 lg:space-x-6">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{employee.user.email}</span>
                    </div>
                    {employee.phone_number && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{employee.phone_number}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Building className="h-4 w-4" />
                      <span>{employee.department_name}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Status and Quick Stats */}
            <div className="flex flex-col space-y-4">
              <div className="text-center lg:text-right">
                <span className={`badge text-lg px-4 py-2 ${
                  employee.status === 'active' ? 'badge-success' : 
                  employee.status === 'inactive' ? 'badge-warning' : 'badge-error'
                }`}>
                  {employee.status?.toUpperCase()}
                </span>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Employee ID</span>
                  <span className="font-mono font-medium">{employee.employee_id}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Hire Date</span>
                  <span className="font-medium">{new Date(employee.hire_date).toLocaleDateString()}</span>
                </div>
                {user.role === 'manager' && employee.salary && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Salary</span>
                    <span className="font-medium text-green-600">${employee.salary.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card animate-slide-up" style={{animationDelay: '200ms'}}>
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="card-body">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Contact Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Contact Information</h3>
                
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="label">
                        <span className="label-text">Phone Number</span>
                      </label>
                      <div className="relative">
                        <Phone className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="tel"
                          name="phone_number"
                          value={form.phone_number}
                          onChange={handleChange}
                          className={`input pl-10 ${validationErrors.phone_number ? 'input-error' : ''}`}
                          placeholder="+1 (555) 123-4567"
                          disabled={loading}
                        />
                      </div>
                      {validationErrors.phone_number && (
                        <span className="text-red-500 text-sm">{validationErrors.phone_number}</span>
                      )}
                    </div>
                    
                    <div>
                      <label className="label">
                        <span className="label-text">Address</span>
                      </label>
                      <div className="relative">
                        <MapPin className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                        <textarea
                          name="address"
                          value={form.address}
                          onChange={handleChange}
                          className="textarea pl-10"
                          rows="3"
                          placeholder="Enter full address"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{employee.phone_number || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">{employee.address || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Employment Overview */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Employment Overview</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Building className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-blue-600">Department</p>
                      <p className="font-medium text-gray-800">{employee.department_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <Briefcase className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-green-600">Position</p>
                      <p className="font-medium text-gray-800">{employee.position_title}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-purple-600">Hire Date</p>
                      <p className="font-medium text-gray-800">{new Date(employee.hire_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  {employee.manager_name && (
                    <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                      <User className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="text-sm text-orange-600">Reports To</p>
                        <p className="font-medium text-gray-800">{employee.manager_name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Employment Tab */}
          {activeTab === 'employment' && user.role === 'manager' && (
            <div className="space-y-8">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Employment Details</h3>
              
              {editing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">
                      <span className="label-text">Department *</span>
                    </label>
                    <select
                      name="department"
                      value={form.department}
                      onChange={handleChange}
                      className={`input ${validationErrors.department ? 'input-error' : ''}`}
                      disabled={loading}
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                    {validationErrors.department && (
                      <span className="text-red-500 text-sm">{validationErrors.department}</span>
                    )}
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text">Position *</span>
                    </label>
                    <select
                      name="position"
                      value={form.position}
                      onChange={handleChange}
                      className={`input ${validationErrors.position ? 'input-error' : ''}`}
                      disabled={loading}
                    >
                      <option value="">Select Position</option>
                      {positions.map(pos => (
                        <option key={pos.id} value={pos.id}>{pos.title}</option>
                      ))}
                    </select>
                    {validationErrors.position && (
                      <span className="text-red-500 text-sm">{validationErrors.position}</span>
                    )}
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text">Manager</span>
                    </label>
                    <select
                      name="manager"
                      value={form.manager}
                      onChange={handleChange}
                      className="input"
                      disabled={loading}
                    >
                      <option value="">No Manager</option>
                      {managers.map(mgr => (
                        <option key={mgr.id} value={mgr.id}>
                          {mgr.user.first_name} {mgr.user.last_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text">Status</span>
                    </label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="input"
                      disabled={loading}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="terminated">Terminated</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text">Hire Date</span>
                    </label>
                    <input
                      type="date"
                      name="hire_date"
                      value={form.hire_date}
                      onChange={handleChange}
                      className="input"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text">Salary</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="number"
                        name="salary"
                        value={form.salary}
                        onChange={handleChange}
                        className={`input pl-10 ${validationErrors.salary ? 'input-error' : ''}`}
                        placeholder="0"
                        disabled={loading}
                      />
                    </div>
                    {validationErrors.salary && (
                      <span className="text-red-500 text-sm">{validationErrors.salary}</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                    <div className="flex items-center space-x-3 mb-3">
                      <Building className="h-6 w-6 text-blue-600" />
                      <h4 className="font-semibold text-blue-800">Department</h4>
                    </div>
                    <p className="text-lg font-bold text-gray-800">{employee.department_name}</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                    <div className="flex items-center space-x-3 mb-3">
                      <Briefcase className="h-6 w-6 text-green-600" />
                      <h4 className="font-semibold text-green-800">Position</h4>
                    </div>
                    <p className="text-lg font-bold text-gray-800">{employee.position_title}</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                    <div className="flex items-center space-x-3 mb-3">
                      <DollarSign className="h-6 w-6 text-purple-600" />
                      <h4 className="font-semibold text-purple-800">Salary</h4>
                    </div>
                    <p className="text-lg font-bold text-gray-800">
                      {employee.salary ? `$${employee.salary.toLocaleString()}` : 'Not set'}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl">
                    <div className="flex items-center space-x-3 mb-3">
                      <User className="h-6 w-6 text-orange-600" />
                      <h4 className="font-semibold text-orange-800">Manager</h4>
                    </div>
                    <p className="text-lg font-bold text-gray-800">{employee.manager_name || 'None'}</p>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl">
                    <div className="flex items-center space-x-3 mb-3">
                      <Calendar className="h-6 w-6 text-red-600" />
                      <h4 className="font-semibold text-red-800">Hire Date</h4>
                    </div>
                    <p className="text-lg font-bold text-gray-800">{new Date(employee.hire_date).toLocaleDateString()}</p>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl">
                    <div className="flex items-center space-x-3 mb-3">
                      <Shield className="h-6 w-6 text-indigo-600" />
                      <h4 className="font-semibold text-indigo-800">Status</h4>
                    </div>
                    <span className={`badge text-lg px-3 py-1 ${
                      employee.status === 'active' ? 'badge-success' : 
                      employee.status === 'inactive' ? 'badge-warning' : 'badge-error'
                    }`}>
                      {employee.status?.toUpperCase()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Personal Info Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-8">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
              
              {editing ? (
                <div className="max-w-2xl space-y-6">
                  <div>
                    <label className="label">
                      <span className="label-text">Date of Birth</span>
                    </label>
                    <div className="relative">
                      <Calendar className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="date"
                        name="date_of_birth"
                        value={form.date_of_birth}
                        onChange={handleChange}
                        className="input pl-10"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-2xl">
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Date of Birth</p>
                      <p className="font-medium">
                        {employee.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString() : 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
