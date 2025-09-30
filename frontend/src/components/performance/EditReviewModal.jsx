// src/components/performance/EditReviewModal.jsx
import { useState, useEffect } from "react";
import { hrapi } from "../../services/api.jwt";

const EditReviewModal = ({ isOpen, onClose, review, onUpdated, role }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const ratingFields = [
    "overall_rating",
    "goals_achievement",
    "communication",
    "teamwork",
    "initiative",
  ];

  useEffect(() => {
    if (!review) return;
    setErrors({});
    setFormData({
      employee: review.employee?.id ?? review.employee ?? null,
      review_period_start: review.review_period_start ?? "",
      review_period_end: review.review_period_end ?? "",
      overall_rating: review.overall_rating ?? "",
      goals_achievement: review.goals_achievement ?? "",
      communication: review.communication ?? "",
      teamwork: review.teamwork ?? "",
      initiative: review.initiative ?? "",
      comments: review.comments ?? "",
      employee_comments: review.employee_comments ?? "",
      status: review.status ?? "draft",
    });
  }, [review]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (ratingFields.includes(name)) {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? null : parseInt(value, 10),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!review?.id) return;
    try {
      const res = await hrapi.updatePerformance(review.id, formData);
      if (onUpdated) onUpdated(res.data);
      onClose();
    } catch (err) {
      if (err.response?.status === 400) {
        setErrors(err.response.data);
      } else {
        console.error("Update failed:", err);
        alert("Có lỗi khi cập nhật.");
      }
    }
  };

  const changeStatus = async (newStatus) => {
    try {
      const res = await hrapi.updatePerformance(review.id, {
        ...formData,
        status: newStatus,
      });
      if (onUpdated) onUpdated(res.data);
      onClose();
    } catch (err) {
      console.error(err);
      alert(`${newStatus} failed`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Edit Performance Review</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee (readonly) */}
          <div>
            <label className="block text-sm font-medium mb-1">Employee</label>
            <input
              type="text"
              value={review?.employee_name ?? review?.employee ?? ""}
              readOnly
              className="w-full border rounded px-3 py-2 bg-gray-100"
            />
          </div>

          {/* Manager view */}
          {role === "manager" && (
            <>
              {["draft", "submitted"].includes(formData.status) && (
                <>
                  {/* Ratings */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {ratingFields.map((name) => (
                      <div key={name}>
                        <label className="block text-sm mb-1">
                          {name.replace(/_/g, " ")}
                        </label>
                        <select
                          name={name}
                          value={formData[name] ?? ""}
                          onChange={handleChange}
                          className="w-full border rounded px-3 py-2"
                        >
                          <option value="">-- Select --</option>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                        {errors[name] && (
                          <p className="text-red-600 text-sm">{errors[name]}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Reviewer Comments */}
                  <div>
                    <label className="block text-sm mb-1">Reviewer Comments</label>
                    <textarea
                      name="comments"
                      rows={3}
                      value={formData.comments || ""}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </>
              )}

              {formData.status === "feedback" && (
                <div>
                  <label className="block text-sm mb-1">Employee Feedback</label>
                  <textarea
                    value={formData.employee_comments || ""}
                    readOnly
                    className="w-full border rounded px-3 py-2 bg-gray-100"
                  />
                </div>
              )}

              {/* Status (readonly) */}
              <div>
                <label className="block text-sm mb-1">Status</label>
                <input
                  type="text"
                  value={formData.status}
                  readOnly
                  className="w-full border rounded px-3 py-2 bg-gray-100"
                />
              </div>
            </>
          )}

          {/* Employee view */}
          {role === "employee" && (
            <>
              {formData.status === "submitted" ? (
                <div>
                  <label className="block text-sm mb-1">Your Feedback</label>
                  <textarea
                    name="employee_comments"
                    rows={3}
                    value={formData.employee_comments || ""}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm mb-1">Your Feedback</label>
                  <textarea
                    value={formData.employee_comments || ""}
                    readOnly
                    className="w-full border rounded px-3 py-2 bg-gray-100"
                  />
                </div>
              )}
            </>
          )}

          {/* Error hiển thị */}
          {errors.non_field_errors && (
            <p className="text-red-600">{errors.non_field_errors}</p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Close
            </button>

            {/* Manager có thể Submit khi draft */}
            {role === "manager" && formData.status === "draft" && (
              <button
                type="button"
                onClick={() => changeStatus("submitted")}
                className="px-4 py-2 bg-yellow-600 text-white rounded"
              >
                Submit
              </button>
            )}

            {/* Manager có thể Finalize khi feedback */}
            {role === "manager" && formData.status === "feedback" && (
              <button
                type="button"
                onClick={() => changeStatus("finalized")}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Finalize
              </button>
            )}

            {/* Update nếu có quyền chỉnh */}
            {((role === "manager" &&
              ["draft", "submitted"].includes(formData.status)) ||
              (role === "employee" && formData.status === "submitted")) && (
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Update
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditReviewModal;
