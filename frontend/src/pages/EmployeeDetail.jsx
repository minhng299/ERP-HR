import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hrapi } from '../services/api.jwt';
import { useAuth } from '../contexts/AuthContext';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await hrapi.getEmployee(id);
        setEmployee(res.data);
        setForm({
          salary: res.data.salary,
          status: res.data.status,
          position: res.data.position,
          department: res.data.department,
          manager: res.data.manager,
        });
      } catch (err) {
        setError('Failed to fetch employee');
      }
    };
    fetchEmployee();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await hrapi.updateEmployee(id, form);
      setEditing(false);
      navigate(0); // reload page
    } catch (err) {
      setError('Failed to update employee');
    }
  };

  if (!employee) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Employee Detail</h1>
        <button className="text-blue-500 underline" onClick={() => navigate("/employees")}>Back</button>
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <div className="flex items-center mb-4">
          <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold text-gray-700">
            {employee.user.first_name[0]}{employee.user.last_name[0]}
          </div>
          <div className="ml-4">
            <div className="text-lg font-semibold">{employee.user.first_name} {employee.user.last_name}</div>
            <div className="text-gray-500">{employee.employee_id}</div>
            <div className="text-gray-500">{employee.user.email}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div><span className="font-semibold">Phone:</span> {employee.phone_number}</div>
          <div><span className="font-semibold">Address:</span> {employee.address}</div>
          <div><span className="font-semibold">DOB:</span> {employee.date_of_birth}</div>
          <div><span className="font-semibold">Hire Date:</span> {employee.hire_date}</div>
          <div><span className="font-semibold">Department:</span> {employee.department_name}</div>
          <div><span className="font-semibold">Position:</span> {employee.position_title}</div>
          <div><span className="font-semibold">Manager:</span> {employee.manager_name || 'None'}</div>
          <div><span className="font-semibold">Status:</span> {employee.status}</div>
          <div><span className="font-semibold">Salary:</span> ${employee.salary}</div>
        </div>
        <div className="mb-4">
          <span className="font-semibold">Profile Picture:</span> {employee.profile_picture ? <img src={employee.profile_picture} alt="Profile" className="h-16 w-16 rounded-full inline-block ml-2" /> : 'N/A'}
        </div>
        {user.role === 'manager' && (
          <>
            {!editing ? (
              <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => setEditing(true)}>Edit</button>
            ) : (
              <form onSubmit={handleUpdate} className="mt-4">
                <div className="mb-2">
                  <label className="block mb-1">Salary</label>
                  <input type="number" name="salary" value={form.salary} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
                </div>
                <div className="mb-2">
                  <label className="block mb-1">Status</label>
                  <select name="status" value={form.status} onChange={handleChange} className="w-full border px-3 py-2 rounded">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
                {/* Add more editable fields as needed */}
                {error && <div className="text-red-500 mb-2">{error}</div>}
                <div className="flex space-x-2 mt-2">
                  <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={() => setEditing(false)}>Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeDetail;
