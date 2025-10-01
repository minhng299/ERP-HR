import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { hrapi } from "../../services/api.jwt";

const NewReviewModal = ({ isOpen, onClose, onReviewCreated }) => {
  const { user: currentUser } = useAuth();

  const [formData, setFormData] = useState({
    employee: "",
    review_period_start: "",
    review_period_end: "",
    goals_achievement: 3,
    communication: 3,
    teamwork: 3,
    initiative: 3,
    comments: "",
  });

  const [employees, setEmployees] = useState([]);
  const [errors, setErrors] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      hrapi.getEmployees().then((response) => {
        let filteredEmployees = response.data;
        if (
          currentUser.role?.toLowerCase() === "manager" &&
          currentUser.department
        ) {
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
        reviewer: currentUser.id,
      });
      if (onReviewCreated) onReviewCreated();
      onClose();
    } catch (error) {
      setErrors(error.response?.data || { detail: "Unexpected error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRatingField = (label, name, value) => (
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={handleChange}
        className="w-full border rounded px-3 py-2"
        required
      >
        <option value={1}>1 - Poor</option>
        <option value={2}>2 - Below Average</option>
        <option value={3}>3 - Average</option>
        <option value={4}>4 - Above Average</option>
        <option value={5}>5 - Excellent</option>
      </select>
    </div>
  );

  const formatErrorMsg = (msg) => {
    if (!msg) return "";
    let text = typeof msg === "string" ? msg : String(msg);
    return text.charAt(0).toUpperCase() + text.slice(1);
  };
  
  const formatFieldName = (field) => {
    if (!field || field === "non_field_errors") return "";
    return field.charAt(0).toUpperCase() + field.slice(1);
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4">New Performance Review</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee
            </label>
            <select
              name="employee"
              value={formData.employee}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">-- Select Employee --</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.user?.first_name} {employee.user?.last_name}
                </option>
              ))}
            </select>
          </div>

          {/* Reviewer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reviewer
            </label>
            <input
              type="text"
              value={`${currentUser?.user?.first_name || ""} ${
                currentUser?.user?.last_name || ""
              }`}
              className="w-full border rounded px-3 py-2 bg-gray-100"
              readOnly
            />
          </div>

          {/* Review Period (From - To) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Review Period
            </label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <span className="text-xs text-gray-500">From</span>
                <input
                  type="date"
                  name="review_period_start"
                  value={formData.review_period_start}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="flex-1">
                <span className="text-xs text-gray-500">To</span>
                <input
                  type="date"
                  name="review_period_end"
                  value={formData.review_period_end}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
            </div>
          </div>

          {/* Ratings: 2 columns x 2 rows */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderRatingField("Goals Achievement", "goals_achievement", formData.goals_achievement)}
            {renderRatingField("Communication", "communication", formData.communication)}
            {renderRatingField("Teamwork", "teamwork", formData.teamwork)}
            {renderRatingField("Initiative", "initiative", formData.initiative)}
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manager Comments
            </label>
            <textarea
              name="comments"
              placeholder="Write comments here..."
              value={formData.comments}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Errors */}
          {errors && (
            <div className="bg-red-100 text-red-700 p-2 rounded text-sm">
              {Object.entries(errors).map(([field, msg]) => (
                <p key={field}>
                  <strong>{formatFieldName(field)}{field !== "non_field_errors" ? ": " : ""}</strong>
                  {Array.isArray(msg) ? msg.map(formatErrorMsg).join(", ") : formatErrorMsg(msg)}
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
