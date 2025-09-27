const ViewReviewModal = ({ isOpen, onClose, review }) => {
  if (!isOpen || !review) return null;

  // Hàm format ngày YYYY-MM-DD -> DD/MM/YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Review Details</h2>
        <div className="space-y-2 text-gray-700">
          <p><strong>Employee:</strong> {review.employee_name}</p>
          <p><strong>Reviewer:</strong> {review.reviewer_name}</p>
          <p>
            <strong>Period (Day/Month/Year):</strong>{" "}
            {formatDate(review.review_period_start)} →{" "}
            {formatDate(review.review_period_end)}
          </p>
          <p><strong>Overall Rating:</strong> {review.overall_rating}/5</p>
          <p><strong>Goals Achievement:</strong> {review.goals_achievement}/5</p>
          <p><strong>Communication:</strong> {review.communication}/5</p>
          <p><strong>Teamwork:</strong> {review.teamwork}/5</p>
          <p><strong>Initiative:</strong> {review.initiative}/5</p>
          <p><strong>Comments:</strong> {review.comments}</p>
          {review.employee_comments && (
            <p><strong>Employee Comments:</strong> {review.employee_comments || "No feedback yet"}</p>
          )}
          <p><strong>Status:</strong> {review.status_display}</p>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewReviewModal;
