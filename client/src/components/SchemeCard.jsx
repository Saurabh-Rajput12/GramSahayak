// Reusable card component for displaying a government welfare scheme
import React from 'react';

// SchemeCard renders scheme name, category badge, eligibility indicators, and action triggers
const SchemeCard = ({ scheme, onViewDetails, onApply }) => {
  // Helper to assign badge colour according to scheme category
  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'farmer':
        return 'bg-success text-white';
      case 'health':
        return 'bg-danger text-white';
      case 'pension':
        return 'bg-warning text-dark';
      case 'housing':
        return 'bg-info text-dark';
      case 'education':
        return 'bg-primary text-white';
      default:
        return 'bg-secondary text-white';
    }
  };

  return (
    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
      <div className="card-body d-flex flex-column p-4">
        {/* Category Badge & Scheme Name */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <span className={`badge rounded-pill px-3 py-1 small text-capitalize ${getCategoryBadgeClass(scheme.category)}`}>
            {scheme.category}
          </span>
          {scheme.minAge > 0 && (
            <span className="badge bg-light text-secondary border small">
              <i className="bi bi-person me-1"></i>Min Age: {scheme.minAge}+
            </span>
          )}
        </div>

        <h5 className="card-title fw-bold text-dark mt-2 mb-2 line-clamp-2">
          {scheme.name}
        </h5>

        <p className="card-text text-muted small flex-grow-1 mb-3">
          {scheme.description && scheme.description.length > 120
            ? `${scheme.description.substring(0, 120)}...`
            : scheme.description}
        </p>

        {/* Eligibility Snapshot */}
        <div className="bg-light p-2 rounded-3 small text-secondary mb-3 border">
          <div className="d-flex justify-content-between mb-1">
            <span>Income Limit:</span>
            <strong>{scheme.maxIncome > 0 ? `₹${scheme.maxIncome.toLocaleString()}/yr` : 'No Limit'}</strong>
          </div>
          <div className="d-flex justify-content-between">
            <span>Documents:</span>
            <span>{scheme.documentsRequired?.length || 0} required</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex gap-2 mt-auto">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm rounded-pill flex-grow-1"
            onClick={() => onViewDetails(scheme)}
          >
            <i className="bi bi-info-circle me-1"></i> Details
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm rounded-pill flex-grow-1"
            onClick={() => onApply(scheme)}
          >
            <i className="bi bi-send-check me-1"></i> Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchemeCard;
