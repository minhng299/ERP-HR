import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { hrapi } from "../../services/api.jwt";

const NewReviewModal = ({ isOpen, onClose, onReviewCreated }) => {
  const { user: currentUser } = useAuth();

  const [formData, setFormData] = useState({
    employee: "",
    review_period_start: "",
    review_period_end: "",
    overall_rating: 3,
    goals_achievement: 3,
    communication: 3,
    teamwork: 3,
    initiative: 3,
    comments: "",
  });

  const [employees, setEmployees] = useState([]);
  const [errors, setErrors] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load danh sách employee (lọc theo department nếu là manager)
  useEffect(() => {
    if (isOpen && currentUser) {
      hrapi.getEmployees().then((response) => {
        let filteredEmployees = response.data;

        if (currentUser.role?.toLowerCase() === "manager" && currentUser.department) {
          filteredEmployees = filteredEmployees.filter(
            (emp) =>
              emp.department === currentUser.department &&
              emp.role?.toLowerCase() === "employee"
          );
        }

        setEmployees(filteredEmployees);
      });
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors(null);

    try {
      await hrapi.createPerformance({
        ...formData,
        reviewer: currentUser.id, // backend sẽ nhận reviewer là manager hiện tại
      });
      if (onReviewCreated) onReviewCreated();
      onClose();
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ detail: "Unexpected error occurred." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">New Performance Review</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee Selection */}
          <select
            name="employee"
            value={formData.employee}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Select Employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.user?.first_name} {employee.user?.last_name}
              </option>
            ))}
          </select>

          {/* Reviewer (readonly) */}
          <input
            type="text"
            value={`${currentUser?.user?.first_name || ""} ${currentUser?.user?.last_name || ""}`}
            className="w-full border rounded px-3 py-2 bg-gray-100"
            readOnly
          />

          {/* Review Period */}
          <div className="flex space-x-2">
            <input
              type="date"
              name="review_period_start"
              value={formData.review_period_start}
              onChange={handleChange}
              className="flex-1 border rounded px-3 py-2"
              required
            />
            <input
              type="date"
              name="review_period_end"
              value={formData.review_period_end}
              onChange={handleChange}
              className="flex-1 border rounded px-3 py-2"
              required
            />
          </div>

          {/* Overall Rating */}
          <select
            name="overall_rating"
            value={formData.overall_rating}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value={1}>1 - Poor</option>
            <option value={2}>2 - Below Average</option>
            <option value={3}>3 - Average</option>
            <option value={4}>4 - Above Average</option>
            <option value={5}>5 - Excellent</option>
          </select>

          {/* Goals Achievement */}
          <select
            name="goals_achievement"
            value={formData.goals_achievement}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value={1}>1 - Poor</option>
            <option value={2}>2 - Below Average</option>
            <option value={3}>3 - Average</option>
            <option value={4}>4 - Above Average</option>
            <option value={5}>5 - Excellent</option>
          </select>

          {/* Communication */}
          <select
            name="communication"
            value={formData.communication}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value={1}>1 - Poor</option>
            <option value={2}>2 - Below Average</option>
            <option value={3}>3 - Average</option>
            <option value={4}>4 - Above Average</option>
            <option value={5}>5 - Excellent</option>
          </select>

          {/* Teamwork */}
          <select
            name="teamwork"
            value={formData.teamwork}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value={1}>1 - Poor</option>
            <option value={2}>2 - Below Average</option>
            <option value={3}>3 - Average</option>
            <option value={4}>4 - Above Average</option>
            <option value={5}>5 - Excellent</option>
          </select>

          {/* Initiative */}
          <select
            name="initiative"
            value={formData.initiative}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value={1}>1 - Poor</option>
            <option value={2}>2 - Below Average</option>
            <option value={3}>3 - Average</option>
            <option value={4}>4 - Above Average</option>
            <option value={5}>5 - Excellent</option>
          </select>

          {/* Comments */}
          <textarea
            name="comments"
            placeholder="Comments"
            value={formData.comments}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />

          {/* Error messages */}
          {errors && (
            <div className="bg-red-100 text-red-700 p-2 rounded">
              {Object.entries(errors).map(([field, msg]) => (
                <p key={field}>
                  <strong>{field}:</strong> {Array.isArray(msg) ? msg.join(", ") : msg}
                </p>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewReviewModal;
