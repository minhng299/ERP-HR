import { useState, useEffect } from "react";

const EditReviewModal = ({ isOpen, onClose, review }) => {
  const [formData, setFormData] = useState(review || {});

  useEffect(() => {
    setFormData(review || {});
  }, [review]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Edited review data:", formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Edit Review</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="employee"
            placeholder="Employee Name"
            value={formData.employee || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="text"
            name="reviewer"
            placeholder="Reviewer Name"
            value={formData.reviewer || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
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
