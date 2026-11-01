// Reusable card component for village community programs and camps
import React from 'react';

// EventCard renders event details, seat capacity countdown, and registration action button
const EventCard = ({ event, isRegistered, onRegister, onCancelRegistration, onViewDetails }) => {
  // Category badge color helper
  const getTypeBadge = (type) => {
    switch (type) {
      case 'health camp':
        return 'bg-danger text-white';
      case 'vaccination':
        return 'bg-success text-white';
      case 'meeting':
        return 'bg-primary text-white';
      case 'training':
        return 'bg-warning text-dark';
      case 'festival':
        return 'bg-info text-dark';
      default:
        return 'bg-secondary text-white';
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const registeredCount = event.registeredUsers?.length || 0;
  const seatsRemaining = Math.max(0, event.seatLimit - registeredCount);
  const isFull = seatsRemaining === 0;

  return (
    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden bg-white">
      <div className="card-body p-4 d-flex flex-column">
        {/* Type Badge & Seats Badge */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className={`badge rounded-pill px-3 py-1 small text-capitalize ${getTypeBadge(event.type)}`}>
            {event.type}
          </span>
          <span className={`badge rounded-pill px-2 py-1 small ${
            seatsRemaining > 5 ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'
          }`}>
            <i className="bi bi-people me-1"></i>
            {seatsRemaining} Seats Left
          </span>
        </div>

        {/* Title */}
        <h5 className="card-title fw-bold text-dark mt-2 mb-2">
          {event.title}
        </h5>

        {/* Date & Venue Info */}
        <div className="small text-muted mb-1">
          <i className="bi bi-calendar3 me-2 text-primary"></i>
          {formatDate(event.date)}
        </div>
        <div className="small text-muted mb-3">
          <i className="bi bi-geo-alt me-2 text-danger"></i>
          {event.venue}
        </div>

        {/* Description snippet */}
        <p className="card-text text-secondary small flex-grow-1 mb-3">
          {event.description && event.description.length > 95
            ? `${event.description.substring(0, 95)}...`
            : event.description}
        </p>

        {/* Action Buttons */}
        <div className="d-flex gap-2 mt-auto pt-2 border-top">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm rounded-pill flex-grow-1"
            onClick={() => onViewDetails(event)}
          >
            <i className="bi bi-info-circle me-1"></i> Details
          </button>

          {isRegistered ? (
            <button
              type="button"
              className="btn btn-outline-danger btn-sm rounded-pill flex-grow-1"
              onClick={() => onCancelRegistration(event._id)}
            >
              <i className="bi bi-x-circle me-1"></i> Cancel Seat
            </button>
          ) : isFull ? (
            <button
              type="button"
              className="btn btn-secondary btn-sm rounded-pill flex-grow-1"
              disabled
            >
              Seats Full
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-sm rounded-pill flex-grow-1"
              onClick={() => onRegister(event._id)}
            >
              <i className="bi bi-check2-circle me-1"></i> Register
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
