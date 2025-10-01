import React, { useState } from 'react';
import { X, User, Mail, Lock, Phone, MapPin, Calendar, DollarSign, Users, Briefcase } from 'lucide-react';

const AddEmployeeModal = ({ 
  show, 
  onClose, 
  onSubmit, 
  newEmployee, 
  setNewEmployee, 
  departments, 
  positions, 
  adding, 
  error 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState({});

  if (!show) return null;

  const steps = [
    { id: 1, title: 'Basic Info', icon: User },
    { id: 2, title: 'Contact & Personal', icon: Phone },
    { id: 3, title: 'Employment', icon: Briefcase }
  ];

  const validateStep = (step) => {
    const errors = {};
    
    if (step === 1) {
      if (!newEmployee.username.trim()) errors.username = 'Username is required';
      if (!newEmployee.email.trim()) errors.email = 'Email is required';
      if (!newEmployee.password) errors.password = 'Password is required';
      if (!newEmployee.first_name.trim()) errors.first_name = 'First name is required';
      if (!newEmployee.last_name.trim()) errors.last_name = 'Last name is required';
    } else if (step === 2) {
      if (!newEmployee.phone_number.trim()) errors.phone_number = 'Phone number is required';
      if (!newEmployee.address.trim()) errors.address = 'Address is required';
      if (!newEmployee.date_of_birth) errors.date_of_birth = 'Date of birth is required';
    } else if (step === 3) {
      if (!newEmployee.employee_id.trim()) errors.employee_id = 'Employee ID is required';
      if (!newEmployee.hire_date) errors.hire_date = 'Hire date is required';
      if (!newEmployee.department) errors.department = 'Department is required';
      if (!newEmployee.position) errors.position = 'Position is required';
      if (!newEmployee.salary) errors.salary = 'Salary is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(3)) {
      onSubmit(e);
    }
  };

  const handleInputChange = (field, value) => {
    setNewEmployee({ ...newEmployee, [field]: value });
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <div className="relative">
                  <User className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    value={newEmployee.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    className={`input pl-10 ${validationErrors.first_name ? 'error' : ''}`}
                    placeholder="John"
                  />
                </div>
                {validationErrors.first_name && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.first_name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <div className="relative">
                  <User className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    value={newEmployee.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    className={`input pl-10 ${validationErrors.last_name ? 'error' : ''}`}
                    placeholder="Doe"
                  />
                </div>
                {validationErrors.last_name && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.last_name}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <div className="relative">
                <User className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={newEmployee.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={`input pl-10 ${validationErrors.username ? 'error' : ''}`}
                  placeholder="johndoe"
                />
              </div>
              {validationErrors.username && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.username}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`input pl-10 ${validationErrors.email ? 'error' : ''}`}
                  placeholder="john.doe@company.com"
                />
              </div>
              {validationErrors.email && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="password"
                  value={newEmployee.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`input pl-10 ${validationErrors.password ? 'error' : ''}`}
                  placeholder="••••••••"
                />
              </div>
              {validationErrors.password && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
              )}
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="tel"
                  value={newEmployee.phone_number}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  className={`input pl-10 ${validationErrors.phone_number ? 'error' : ''}`}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              {validationErrors.phone_number && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.phone_number}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <div className="relative">
                <MapPin className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                <textarea
                  value={newEmployee.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={`input pl-10 resize-none h-20 ${validationErrors.address ? 'error' : ''}`}
                  placeholder="123 Main St, City, State, ZIP"
                />
              </div>
              {validationErrors.address && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.address}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth *
              </label>
              <div className="relative">
                <Calendar className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="date"
                  value={newEmployee.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  className={`input pl-10 ${validationErrors.date_of_birth ? 'error' : ''}`}
                />
              </div>
              {validationErrors.date_of_birth && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.date_of_birth}</p>
              )}
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee ID *
              </label>
              <input
                type="text"
                value={newEmployee.employee_id}
                onChange={(e) => handleInputChange('employee_id', e.target.value)}
                className={`input ${validationErrors.employee_id ? 'error' : ''}`}
                placeholder="EMP001"
              />
              {validationErrors.employee_id && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.employee_id}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hire Date *
              </label>
              <div className="relative">
                <Calendar className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="date"
                  value={newEmployee.hire_date}
                  onChange={(e) => handleInputChange('hire_date', e.target.value)}
                  className={`input pl-10 ${validationErrors.hire_date ? 'error' : ''}`}
                />
              </div>
              {validationErrors.hire_date && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.hire_date}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <div className="relative">
                  <Users className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <select
                    value={newEmployee.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className={`input pl-10 appearance-none ${validationErrors.department ? 'error' : ''}`}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                {validationErrors.department && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.department}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position *
                </label>
                <div className="relative">
                  <Briefcase className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <select
                    value={newEmployee.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className={`input pl-10 appearance-none ${validationErrors.position ? 'error' : ''}`}
                  >
                    <option value="">Select Position</option>
                    {positions.map(pos => (
                      <option key={pos.id} value={pos.id}>{pos.title}</option>
                    ))}
                  </select>
                </div>
                {validationErrors.position && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.position}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Annual Salary *
              </label>
              <div className="relative">
                <DollarSign className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="number"
                  value={newEmployee.salary}
                  onChange={(e) => handleInputChange('salary', e.target.value)}
                  className={`input pl-10 ${validationErrors.salary ? 'error' : ''}`}
                  placeholder="50000"
                  min="0"
                  step="1000"
                />
              </div>
              {validationErrors.salary && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.salary}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manager (Optional)
              </label>
              <input
                type="text"
                value={newEmployee.manager}
                onChange={(e) => handleInputChange('manager', e.target.value)}
                className="input"
                placeholder="Manager Employee ID"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={newEmployee.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="input appearance-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Add New Employee</h2>
              <p className="text-gray-600 mt-1">Step {currentStep} of 3: {steps[currentStep - 1].title}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                    ${currentStep >= step.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                    }
                  `}>
                    {currentStep > step.id ? '✓' : step.id}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`ml-4 w-8 h-px transition-colors ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderStepContent()}
            
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-slide-up">
                <div className="flex items-center">
                  <span className="text-red-500 mr-2">❌</span>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between">
              <button
                type="button"
                onClick={currentStep === 1 ? onClose : handlePrev}
                className="btn btn-secondary"
              >
                {currentStep === 1 ? 'Cancel' : 'Previous'}
              </button>
              
              <div className="flex space-x-3">
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn btn-primary"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={adding}
                  >
                    {adding ? (
                      <div className="flex items-center">
                        <div className="animate-pulse mr-2">⏳</div>
                        Adding Employee...
                      </div>
                    ) : (
                      'Add Employee'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
