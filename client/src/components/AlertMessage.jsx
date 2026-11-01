// Reusable Bootstrap alert component for displaying success and error notices
import React from 'react';

// Renders an alert box with appropriate Bootstrap styling and an optional dismiss button
const AlertMessage = ({ type = 'danger', message, onClose }) => {
  if (!message) return null;

  return (
    <div className={`alert alert-${type} alert-dismissible fade show rounded-3 shadow-sm my-3`} role="alert">
      <div className="d-flex align-items-center">
        <i className={`bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2 fs-5`}></i>
        <div>{message}</div>
      </div>
      {onClose && (
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={onClose}
        ></button>
      )}
    </div>
  );
};

export default AlertMessage;
