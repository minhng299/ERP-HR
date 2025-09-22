const ViewReviewModal = ({ isOpen, onClose, review }) => {
    if (!isOpen || !review) return null;
  
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Review Details</h2>
          <div className="space-y-2 text-gray-700">
            <p><strong>Employee:</strong> {review.employee}</p>
            <p><strong>Reviewer:</strong> {review.reviewer}</p>
            <p><strong>Period:</strong> {review.start} - {review.end}</p>
            <p><strong>Overall Rating:</strong> {review.overall}/5</p>
            <p><strong>Goals:</strong> {review.goals}/5</p>
            <p><strong>Communication:</strong> {review.communication}/5</p>
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
  