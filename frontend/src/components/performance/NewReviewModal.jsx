import { useState } from "react";

const NewReviewModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    employee: "",
    reviewer: "",
    start: "",
    end: "",
    overall: 3,
    goals: 3,
    communication: 3,
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("New review data:", formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">New Performance Review</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="employee"
            placeholder="Employee Name"
            value={formData.employee}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="text"
            name="reviewer"
            placeholder="Reviewer Name"
            value={formData.reviewer}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
          <div className="flex space-x-2">
            <input
              type="date"
              name="start"
              value={formData.start}
              onChange={handleChange}
              className="flex-1 border rounded px-3 py-2"
            />
            <input
              type="date"
              name="end"
              value={formData.end}
              onChange={handleChange}
              className="flex-1 border rounded px-3 py-2"
            />
          </div>
          <select
            name="overall"
            value={formData.overall}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="1">1 - Poor</option>
            <option value="2">2 - Below Average</option>
            <option value="3">3 - Average</option>
            <option value="4">4 - Above Average</option>
            <option value="5">5 - Excellent</option>
          </select>
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
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewReviewModal;
