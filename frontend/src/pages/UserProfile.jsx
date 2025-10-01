import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, Key, 
  Edit2, Save, X, Eye, EyeOff, Shield,
  Building, Briefcase, Camera
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { hrapi } from '../services/api.jwt';

const UserProfile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile form state
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
    date_of_birth: '',
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.user?.first_name || '',
        last_name: user.user?.last_name || '',
        email: user.user?.email || '',
        phone_number: user.phone_number || '',
        address: user.address || '',
        date_of_birth: user.date_of_birth || '',
      });
    }
  }, [user]);

  const validateProfileForm = () => {
    const errors = {};
    
    if (!profileData.first_name.trim()) {
      errors.first_name = 'First name is required';
    }
    if (!profileData.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }
    if (!profileData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      errors.email = 'Email is invalid';
    }
    if (profileData.phone_number && !/^\+?[\d\s\-\(\)]{10,}$/.test(profileData.phone_number)) {
      errors.phone_number = 'Phone number is invalid';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordData.current_password) {
      errors.current_password = 'Current password is required';
    }
    if (!passwordData.new_password) {
      errors.new_password = 'New password is required';
    } else if (passwordData.new_password.length < 8) {
      errors.new_password = 'Password must be at least 8 characters';
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateProfileForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await hrapi.updateMyProfile(profileData);
      setSuccess('Profile updated successfully!');
      setEditing(false);
      // Note: In a real app, you might want to refresh user data in context
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await hrapi.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      setSuccess('Password changed successfully!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err) {
      if (err.response?.status === 400) {
        setError('Current password is incorrect');
      } else {
        setError('Failed to change password. Please try again.');
      }
      console.error('Password change error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    return `${profileData.first_name?.charAt(0) || ''}${profileData.last_name?.charAt(0) || ''}`.toUpperCase();
  };

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'password', label: 'Change Password', icon: Key },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-responsive-xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information and account settings</p>
        </div>
      </div>

      {/* Profile Card Header */}
      <div className="card animate-slide-up">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {getInitials()}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border hover:bg-gray-50 transition-colors">
                <Camera className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl font-bold text-gray-800">
                {profileData.first_name} {profileData.last_name}
              </h2>
              <p className="text-gray-600">{user?.user?.email}</p>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <span className="badge badge-info">
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </span>
                <span className="badge badge-success">Active</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center space-x-2">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{user?.department_name}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-center space-x-2">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{user?.position_title}</span>
                </div>
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
                  onClick={() => {
                    setActiveTab(tab.id);
                    setEditing(false);
                    setError('');
                    setSuccess('');
                    setValidationErrors({});
                  }}
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
          {/* Alert Messages */}
          {error && (
            <div className="alert alert-error mb-6">
              <X className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="alert alert-success mb-6">
              <span>{success}</span>
            </div>
          )}

          {/* Profile Information Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditing(false);
                        setValidationErrors({});
                        // Reset form data
                        setProfileData({
                          first_name: user.user?.first_name || '',
                          last_name: user.user?.last_name || '',
                          email: user.user?.email || '',
                          phone_number: user.phone_number || '',
                          address: user.address || '',
                          date_of_birth: user.date_of_birth || '',
                        });
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleProfileSubmit}
                      disabled={loading}
                      className="btn btn-primary btn-sm"
                    >
                      <Save className="h-4 w-4" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">
                    <span className="label-text">First Name *</span>
                  </label>
                  <input
                    type="text"
                    className={`input pl-5 ${validationErrors.first_name ? 'input-error' : ''}`}
                    value={profileData.first_name}
                    onChange={(e) => setProfileData(prev => ({...prev, first_name: e.target.value}))}
                    disabled={!editing}
                    required
                  />
                  {validationErrors.first_name && (
                    <span className="text-red-500 text-sm mt-1">{validationErrors.first_name}</span>
                  )}
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Last Name *</span>
                  </label>
                  <input
                    type="text"
                    className={`input pl-5 ${validationErrors.last_name ? 'input-error' : ''}`}
                    value={profileData.last_name}
                    onChange={(e) => setProfileData(prev => ({...prev, last_name: e.target.value}))}
                    disabled={!editing}
                    required
                  />
                  {validationErrors.last_name && (
                    <span className="text-red-500 text-sm mt-1">{validationErrors.last_name}</span>
                  )}
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Email Address *</span>
                  </label>
                  <div className="flex-1 relative">
                    <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      className={`input w-full pl-10 pr-4 ${validationErrors.email ? 'input-error' : ''}`}
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({...prev, email: e.target.value}))}
                      disabled={!editing}
                      required
                    />
                  </div>
                  {validationErrors.email && (
                    <span className="text-red-500 text-sm mt-1">{validationErrors.email}</span>
                  )}
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Phone Number</span>
                  </label>
                  <div className="relative">
                    <Phone className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="tel"
                      className={`input pl-10 ${validationErrors.phone_number ? 'input-error' : ''}`}
                      value={profileData.phone_number}
                      onChange={(e) => setProfileData(prev => ({...prev, phone_number: e.target.value}))}
                      disabled={!editing}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  {validationErrors.phone_number && (
                    <span className="text-red-500 text-sm mt-1">{validationErrors.phone_number}</span>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="label">
                    <span className="label-text">Address</span>
                  </label>
                  <div className="relative">
                    <MapPin className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                    <textarea
                      className="input pl-10 pt-5"
                      rows="3"
                      value={profileData.address}
                      onChange={(e) => setProfileData(prev => ({...prev, address: e.target.value}))}
                      disabled={!editing}
                      placeholder="Enter your full address"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Date of Birth</span>
                  </label>
                  <div className="relative">
                    <Calendar className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="date"
                      className="input pl-10"
                      value={profileData.date_of_birth}
                      onChange={(e) => setProfileData(prev => ({...prev, date_of_birth: e.target.value}))}
                      disabled={!editing}
                    />
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Change Password Tab */}
          {activeTab === 'password' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Change Password</h3>
                <p className="text-gray-600 mt-1">Ensure your account stays secure with a strong password</p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Current Password *</span>
                  </label>
                  <div className="relative">
                    <Key className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      className={`input pl-10 pr-10 ${validationErrors.current_password ? 'input-error' : ''}`}
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData(prev => ({...prev, current_password: e.target.value}))}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({...prev, current: !prev.current}))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {validationErrors.current_password && (
                    <span className="text-red-500 text-sm mt-1">{validationErrors.current_password}</span>
                  )}
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">New Password *</span>
                  </label>
                  <div className="relative">
                    <Key className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      className={`input pl-10 pr-10 ${validationErrors.new_password ? 'input-error' : ''}`}
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData(prev => ({...prev, new_password: e.target.value}))}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({...prev, new: !prev.new}))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-0"
                      tabIndex={-1}
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {validationErrors.new_password && (
                    <span className="text-red-500 text-sm mt-1">{validationErrors.new_password}</span>
                  )}
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Confirm New Password *</span>
                  </label>
                  <div className="relative">
                    <Key className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      className={`input pl-10 pr-10 ${validationErrors.confirm_password ? 'input-error' : ''}`}
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData(prev => ({...prev, confirm_password: e.target.value}))}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({...prev, confirm: !prev.confirm}))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {validationErrors.confirm_password && (
                    <span className="text-red-500 text-sm mt-1">{validationErrors.confirm_password}</span>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? 'Changing Password...' : 'Change Password'}
                  </button>
                </div>
              </form>

              {/* Password Requirements */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Password Requirements:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• Mix of uppercase and lowercase letters</li>
                  <li>• At least one number</li>
                  <li>• At least one special character</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;