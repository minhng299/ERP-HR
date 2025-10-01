import React, { useEffect, useState } from 'react';
import { hrapi } from '../services/api.jwt';
import { useAuth } from '../contexts/AuthContext';

const SetSalary = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [salaryInputs, setSalaryInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    hrapi.getEmployees()
      .then(res => {
        setEmployees(res.data);
        // Khởi tạo input lương cơ bản cho từng nhân viên
        const initial = {};
        res.data.forEach(emp => {
          initial[emp.id] = emp.salary || '';
        });
        setSalaryInputs(initial);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load employees');
        setLoading(false);
      });
  }, []);

  const handleInputChange = (id, value) => {
    setSalaryInputs({ ...salaryInputs, [id]: value });
  };

  const handleSetSalary = (id, name) => {
    if (!window.confirm(`Xác nhận lưu lương cho ${name}?`)) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    hrapi.setBaseSalary(id, salaryInputs[id])
      .then(() => {
        setSuccess('Lưu lương thành công!');
        setSaving(false);
      })
      .catch(() => {
        setError('Lưu lương thất bại!');
        setSaving(false);
      });
  };

  if (!user || user.role !== 'manager') return null;
  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Set Basic Salary for Employees</h2>
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Department</th>
            <th className="py-2 px-4 border-b">Current Salary</th>
            <th className="py-2 px-4 border-b">Set Salary</th>
            <th className="py-2 px-4 border-b"></th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.id}>
              <td className="py-2 px-4 border-b">{emp.user?.first_name} {emp.user?.last_name}</td>
              <td className="py-2 px-4 border-b">{emp.department_name || 'N/A'}</td>
              <td className="py-2 px-4 border-b">{emp.salary || <span className="text-gray-400">NaN</span>}</td>
              <td className="py-2 px-4 border-b">
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-32"
                  value={salaryInputs[emp.id]}
                  onChange={e => handleInputChange(emp.id, e.target.value)}
                  placeholder="Nhập lương..."
                />
              </td>
              <td className="py-2 px-4 border-b">
                <button
                  className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                  onClick={() => handleSetSalary(emp.id, `${emp.user?.first_name} ${emp.user?.last_name}`)}
                  disabled={saving}
                >
                  Confirm
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SetSalary;
