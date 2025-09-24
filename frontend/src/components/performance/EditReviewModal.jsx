import { useState, useEffect } from "react";
import axios from "axios";

const EditReviewModal = ({ isOpen, onClose, review, onUpdated }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(review || {});
    setErrors({});
  }, [review]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `http://localhost:8000/api/performances/${review.id}/`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
          },
        }
      );
      onUpdated(res.data); // cập nhật danh sách cha
      onClose();
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setErrors(err.response.data);
      } else {
        console.error("Update failed:", err);
      }
    }
  };

  // danh sách các tiêu chí đánh giá
  const ratingFields = [
    { name: "overall_rating", label: "Overall Performance" },
    { name: "goals_achievement", label: "Goals Achievement" },
    { name: "communication", label: "Communication" },
    { name: "teamwork", label: "Teamwork" },
    { name: "initiative", label: "Initiative" },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Edit Performance Review</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee (readonly) */}
          <div>
            <label className="block text-sm font-medium mb-1">Employee</label>
            <input
              type="text"
              value={formData.employee_name || ""}
              className="w-full border rounded px-3 py-2 bg-gray-100"
              readOnly
            />
          </div>

          {/* Review Period */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Review Period
            </label>
            <div className="flex space-x-2">
              <input
                type="date"
                name="review_period_start"
                value={formData.review_period_start || ""}
                onChange={handleChange}
                className="flex-1 border rounded px-3 py-2"
              />
              <input
                type="date"
                name="review_period_end"
                value={formData.review_period_end || ""}
                onChange={handleChange}
                className="flex-1 border rounded px-3 py-2"
              />
            </div>
            {errors.review_period_start && (
              <p className="text-red-600 text-sm">{errors.review_period_start}</p>
            )}
            {errors.review_period_end && (
              <p className="text-red-600 text-sm">{errors.review_period_end}</p>
            )}
          </div>

          {/* Ratings */}
          <div>
            <label className="block text-sm font-medium mb-1">Ratings</label>
            <div className="space-y-2">
              {ratingFields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm">{field.label}</label>
                  <select
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select rating</option>
                    <option value="1">1 - Poor</option>
                    <option value="2">2 - Below Average</option>
                    <option value="3">3 - Average</option>
                    <option value="4">4 - Above Average</option>
                    <option value="5">5 - Excellent</option>
                  </select>
                  {errors[field.name] && (
                    <p className="text-red-600 text-sm">{errors[field.name]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium mb-1">Comments</label>
            <textarea
              name="comments"
              placeholder="Comments"
              value={formData.comments || ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
            {errors.comments && (
              <p className="text-red-600 text-sm">{errors.comments}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditReviewModal;
