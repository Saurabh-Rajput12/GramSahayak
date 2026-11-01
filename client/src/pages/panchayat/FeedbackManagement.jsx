// Citizen Feedback Management panel for reviewing suggestions and villager appreciation
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AlertMessage from '../../components/AlertMessage';

// FeedbackManagement component displays incoming citizen suggestions and issues with read toggling
const FeedbackManagement = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');

  // Fetch feedback records with optional type filter
  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (typeFilter) params.type = typeFilter;

      const response = await axios.get('/api/feedback', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setFeedbackList(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Fetch feedback error:', err);
      setError('Unable to load citizen feedback.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchFeedback();
    }
  }, [typeFilter, token]);

  // Mark feedback as read
  const handleMarkAsRead = async (id) => {
    try {
      setError('');
      await axios.put(`/api/feedback/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Feedback marked as reviewed.');
      fetchFeedback();
    } catch (err) {
      console.error('Mark read error:', err);
      setError('Failed to mark feedback as read.');
    }
  };

  // Delete feedback entry
  const handleDeleteFeedback = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback entry?')) return;
    try {
      setError('');
      await axios.delete(`/api/feedback/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Feedback entry deleted.');
      fetchFeedback();
    } catch (err) {
      console.error('Delete feedback error:', err);
      setError('Failed to delete feedback.');
    }
  };

  // Date formatter
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Type badge styling helper
  const getTypeBadge = (type) => {
    switch (type) {
      case 'appreciation':
        return 'bg-success text-white';
      case 'problem':
        return 'bg-danger text-white';
      case 'suggestion':
      default:
        return 'bg-primary text-white';
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            <span className="text-info me-2">💬</span> Citizen Feedback & Suggestions Viewer
          </h2>
          <p className="text-muted small mb-0">Review village suggestions, grievances, and appreciations from residents</p>
        </div>

        {/* Filter dropdown */}
        <div style={{ minWidth: '180px' }}>
          <select
            className="form-select form-select-sm"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Feedback Types</option>
            <option value="suggestion">Suggestions</option>
            <option value="appreciation">Appreciations</option>
            <option value="problem">Problems / Issues</option>
          </select>
        </div>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />

      {loading ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border"><div className="spinner-border text-success"></div></div>
      ) : feedbackList.length === 0 ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border text-muted">No feedback entries found.</div>
      ) : (
        <div className="row g-4">
          {feedbackList.map((fb) => (
            <div key={fb._id} className="col-12 col-md-6">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4 bg-white d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <span className={`badge rounded-pill px-3 py-1 small text-capitalize me-2 ${getTypeBadge(fb.type)}`}>
                      {fb.type}
                    </span>
                    <span className="text-warning small">
                      {'⭐'.repeat(fb.rating || 5)} ({fb.rating}/5)
                    </span>
                  </div>
                  <span className="small text-muted">{formatDate(fb.createdAt)}</span>
                </div>

                <h5 className="fw-bold text-dark mt-2 mb-1">{fb.subject}</h5>
                <div className="small text-muted mb-2">
                  <i className="bi bi-person me-1"></i> From: <strong>{fb.user?.name || 'Villager'}</strong> (@{fb.user?.username})
                </div>

                <p className="text-secondary small flex-grow-1" style={{ whiteSpace: 'pre-line' }}>
                  {fb.message}
                </p>

                <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-auto">
                  {fb.isRead ? (
                    <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1 small">
                      <i className="bi bi-check2-all me-1"></i> Reviewed
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-success rounded-pill px-3"
                      onClick={() => handleMarkAsRead(fb._id)}
                    >
                      <i className="bi bi-check-lg me-1"></i> Mark as Reviewed
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger rounded-circle p-1"
                    title="Delete feedback"
                    onClick={() => handleDeleteFeedback(fb._id)}
                  >
                    <i className="bi bi-trash3"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackManagement;
