import React from 'react';

const AddEmployeeModal = ({ show, onClose, onSubmit, newEmployee, setNewEmployee, departments, positions, adding, error }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form onSubmit={onSubmit} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md overflow-y-auto max-h-[90vh]">
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
          <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={adding}>{adding ? 'Adding...' : 'Add'}</button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployeeModal;
