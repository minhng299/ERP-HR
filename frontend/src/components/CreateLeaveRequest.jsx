import { useState, useEffect } from 'react';
import { getToken, hrapi } from '../services/api.jwt';

const CreateLeaveRequest = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: '',
  });

  const [leaveTypes, setLeaveTypes] = useState([]);

  useEffect(() => {
    const token = getToken();
    const fetchLeaveTypes = async () => {
      try {
        const res = await hrapi.getLeaveTypes(token);
        setLeaveTypes(res.data);
      } catch (error) {
        console.error("Lỗi khi tải loại nghỉ:", error);
      }
    };
    fetchLeaveTypes();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra dữ liệu trước khi gửi
    const { leave_type_id, start_date, end_date, reason } = formData;
    if (!leave_type_id || !start_date || !end_date || !reason) {
      alert("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    const payload = {
      leave_type: formData.leave_type_id,
      start_date: formData.start_date,
      end_date: formData.end_date,
      reason: formData.reason,
    };

    const token = getToken();
    console.log("Token đang dùng:", token);
    try {
      await hrapi.createLeaveRequest(payload, token);
      alert('Đã gửi đơn nghỉ thành công!');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Gửi đơn nghỉ thất bại:", error.response?.data || error.message);
      alert('Gửi đơn nghỉ thất bại! Vui lòng kiểm tra lại thông tin.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
      <h2 className="text-xl font-semibold text-gray-700">Tạo đơn nghỉ</h2>

      <select name="leave_type_id" value={formData.leave_type_id} onChange={handleChange} className="input">
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
