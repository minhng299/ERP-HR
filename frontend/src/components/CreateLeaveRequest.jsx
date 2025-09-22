import { useState, useEffect } from 'react';
import { getToken, hrapi } from '../services/api.jwt';


const CreateLeaveRequest = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    leave_type: '',
    start_date: '',
    end_date: '',
    reason: '',
  });

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const token = getToken();
    const fetchOptions = async () => {
      const [typesRes, empRes] = await Promise.all([
        hrapi.getLeaveTypes(token),
        hrapi.getEmployees(token),
      ]);
      setLeaveTypes(typesRes.data);
      setEmployees(empRes.data);
    };
    fetchOptions();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();
    try {
      await hrapi.createLeaveRequest(formData, token);
      alert('Đã gửi đơn nghỉ thành công!');
      if (onSuccess) onSuccess();
    } catch (error) {
      alert('Gửi đơn nghỉ thất bại!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
      <h2 className="text-xl font-semibold text-gray-700">Tạo đơn nghỉ</h2>

      <select name="leave_type" value={formData.leave_type} onChange={handleChange} className="input">
        <option value="">-- Chọn loại nghỉ --</option>
        {leaveTypes.map(type => (
          <option key={type.id} value={type.id}>{type.name}</option>
        ))}
      </select>

      <div className="flex space-x-4">
        <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="input w-1/2" />
        <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="input w-1/2" />
      </div>

      <textarea name="reason" value={formData.reason} onChange={handleChange} placeholder="Lý do nghỉ" className="input" />

      <button type="submit" className="btn bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded">
        Gửi đơn nghỉ
      </button>
    </form>
  );
};

export default CreateLeaveRequest;
