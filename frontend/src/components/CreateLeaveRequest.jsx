// import { useState, useEffect } from 'react';
// import { getToken, hrapi } from '../services/api.jwt';

// const CreateLeaveRequest = ({ onSuccess }) => {
//   const [formData, setFormData] = useState({
//     leave_type_id: '',
//     start_date: '',
//     end_date: '',
//     reason: '',
//   });

//   const [leaveTypes, setLeaveTypes] = useState([]);

//   useEffect(() => {
//     const token = getToken();
//     const fetchLeaveTypes = async () => {
//       try {
//         const res = await hrapi.getLeaveTypes(token);
//         setLeaveTypes(res.data);
//       } catch (error) {
//         console.error("Lỗi khi tải loại nghỉ:", error);
//       }
//     };
//     fetchLeaveTypes();
//   }, []);

//   const handleChange = (e) => {
//     setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Kiểm tra dữ liệu trước khi gửi
//     const { leave_type_id, start_date, end_date, reason } = formData;
//     if (!leave_type_id || !start_date || !end_date || !reason) {
//       alert("Vui lòng điền đầy đủ thông tin.");
//       return;
//     }

//     const payload = {
//       leave_type: formData.leave_type_id,
//       start_date: formData.start_date,
//       end_date: formData.end_date,
//       reason: formData.reason,
//       status: 'pending'
//     };

//     const token = getToken();
//     try {
//       await hrapi.createLeaveRequest(payload, token);
//       alert('Đã gửi đơn nghỉ thành công!');
//       if (onSuccess) onSuccess();
//     } catch (error) {
//       console.error("Gửi đơn nghỉ thất bại:", error.response?.data || error.message);
//       alert('Gửi đơn nghỉ thất bại! Vui lòng kiểm tra lại thông tin.');
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
//       <h2 className="text-xl font-semibold text-gray-700">Tạo đơn nghỉ</h2>

//       <select name="leave_type_id" value={formData.leave_type_id} onChange={handleChange} className="input">
//         <option value="">-- Chọn loại nghỉ --</option>
//         {leaveTypes.map(type => (
//           <option key={type.id} value={type.id}>{type.name}</option>
//         ))}
//       </select>

//       <div className="flex space-x-4">
//         <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="input w-1/2" />
//         <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="input w-1/2" />
//       </div>

//       <textarea name="reason" value={formData.reason} onChange={handleChange} placeholder="Lý do nghỉ" className="input" />

//       <button
//   type="submit"
//   className="btn bg-transparent text-blue-500 border border-blue-500 hover:bg-blue-50 px-4 py-2 rounded"
// >
//   Gửi đơn nghỉ
// </button>
//     </form>
//   );
// };

// export default CreateLeaveRequest;
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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

  // Tính số ngày nghỉ
  // const calculateDays = () => {
  //   const { start_date, end_date } = formData;
  //   if (start_date && end_date) {
  //     const start = new Date(start_date);
  //     const end = new Date(end_date);
  //     if (start <= end) {
  //       // Tính số ngày, bao gồm cả ngày bắt đầu và kết thúc
  //       const diffInMs = end.getTime() - start.getTime();
  //       const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  //       return diffInDays + 1; // +1 vì tính cả ngày bắt đầu
  //     }
  //   }
  //   return 0;
  // };
  const calculateDays = () => {
  const { start_date, end_date } = formData;
  if (start_date && end_date) {
    const start = new Date(start_date);
    const end = new Date(end_date);
    if (start <= end) {
      let days = 0;
      const current = new Date(start);
      while (current <= end) {
        const dayOfWeek = current.getDay(); // 0 = CN, 6 = Thứ 7
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          days++;
        }
        current.setDate(current.getDate() + 1);
      }
      return days;
    }
  }
  return 0;
};


  const validateForm = () => {
    const newErrors = {};
    const today = new Date().toISOString().split('T')[0]; // Định dạng YYYY-MM-DD

    if (!formData.leave_type_id) newErrors.leave_type_id = "Vui lòng chọn loại nghỉ";
    if (!formData.start_date) newErrors.start_date = "Vui lòng chọn ngày bắt đầu";
    if (!formData.end_date) newErrors.end_date = "Vui lòng chọn ngày kết thúc";
    if (!formData.reason) newErrors.reason = "Vui lòng nhập lý do";

    if (formData.start_date && formData.end_date) {
      if (formData.start_date > formData.end_date) {
        newErrors.date_range = "Ngày bắt đầu không được sau ngày kết thúc";
      }
      // Nếu công ty không cho phép nghỉ trong quá khứ, kiểm tra ngày bắt đầu
      if (formData.start_date < today) {
        newErrors.start_date = "Không được chọn ngày trong quá khứ";
      }
    }

    return newErrors;
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    // Xóa lỗi khi người dùng bắt đầu nhập
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      leave_type: formData.leave_type_id,
      start_date: formData.start_date,
      end_date: formData.end_date,
      reason: formData.reason,
      status: 'pending'
    };

    const token = getToken();
    setLoading(true);
    try {
      await hrapi.createLeaveRequest(payload, token);
      alert('Đã gửi đơn nghỉ thành công!');
      if (onSuccess) onSuccess();
      // Reset form
      setFormData({
        leave_type_id: '',
        start_date: '',
        end_date: '',
        reason: '',
      });
      setErrors({});
    } catch (error) {
      console.error("Gửi đơn nghỉ thất bại:", error.response?.data || error.message);
      alert('Gửi đơn nghỉ thất bại! Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  const daysRequested = calculateDays();

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
      <h2 className="text-xl font-semibold text-gray-700">Tạo đơn nghỉ</h2>

      <div>
        <select 
          name="leave_type_id" 
          value={formData.leave_type_id} 
          onChange={handleChange} 
          className={`input ${errors.leave_type_id ? 'border-red-500' : ''}`}
        >
          <option value="">-- Chọn loại nghỉ --</option>
          {leaveTypes.map(type => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
        </select>
        {errors.leave_type_id && <p className="text-red-500 text-sm mt-1">{errors.leave_type_id}</p>}
      </div>

      <div className="flex space-x-4">
        <div className="w-1/2">
          <input 
            type="date" 
            name="start_date" 
            value={formData.start_date} 
            onChange={handleChange} 
            className={`input ${errors.start_date ? 'border-red-500' : ''}`} 
          />
          {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
        </div>
        <div className="w-1/2">
          <input 
            type="date" 
            name="end_date" 
            value={formData.end_date} 
            onChange={handleChange} 
            className={`input ${errors.end_date ? 'border-red-500' : ''}`} 
          />
          {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
        </div>
      </div>
      {errors.date_range && <p className="text-red-500 text-sm">{errors.date_range}</p>}

      {daysRequested > 0 && (
        <p className="text-blue-600">Số ngày nghỉ: {daysRequested} ngày</p>
      )}

      <div>
        <textarea 
          name="reason" 
          value={formData.reason} 
          onChange={handleChange} 
          placeholder="Lý do nghỉ" 
          className={`input ${errors.reason ? 'border-red-500' : ''}`} 
        />
        {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`btn ${loading ? 'bg-gray-400' : 'bg-transparent text-blue-500 border border-blue-500 hover:bg-blue-50'} px-4 py-2 rounded`}
      >
        {loading ? 'Đang gửi...' : 'Gửi đơn nghỉ'}
      </button>
    </form>
  );
};

export default CreateLeaveRequest;