// Reusable card component for displaying a village public notice
import React from 'react';

// NoticeCard renders announcement title, formatted date, category badge, and bulletin body
const NoticeCard = ({ notice }) => {
  // Helper to determine badge color depending on notice type
  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'meeting':
        return 'bg-primary text-white';
      case 'camp':
        return 'bg-success text-white';
      case 'water':
        return 'bg-info text-dark';
      case 'general':
      default:
        return 'bg-secondary text-white';
    }
  };

  // Helper to format ISO date string into readable Indian standard format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="card h-100 border-0 shadow-sm rounded-4">
      <div className="card-body p-4 d-flex flex-column">
        {/* Type Badge & Date */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className={`badge rounded-pill px-3 py-1 small text-capitalize ${getTypeBadgeClass(notice.type)}`}>
            {notice.type}
          </span>
          <span className="small text-muted">
            <i className="bi bi-clock me-1"></i> {formatDate(notice.date)}
          </span>
        </div>

        {/* Notice Title */}
        <h5 className="card-title fw-bold text-dark mt-2 mb-2">
          {notice.title}
        </h5>

        {/* Notice Body Text */}
        <p className="card-text text-secondary small flex-grow-1" style={{ whiteSpace: 'pre-line' }}>
          {notice.body}
        </p>

        {/* Official Gram Panchayat Stamp Badge */}
        <div className="pt-2 border-top mt-auto d-flex align-items-center text-muted small">
          <i className="bi bi-patch-check-fill text-success me-1"></i>
          <span>Official Gram Panchayat Notice</span>
        </div>
      </div>
    </div>
  );
};

export default NoticeCard;
